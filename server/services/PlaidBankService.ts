import type { Result } from "@/util/type";

import type { Tx, UnsavedTx } from "@/types/tx";

import type {
  BankAccount,
  BankTransaction,
  IBankService,
} from "./IBankService";

import { createId } from "@paralleldrive/cuid2";
import { MdsType, Prisma } from "@prisma/client";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import { isAxiosError } from "axios";
import { convertPlaidCatToCat } from "lib/domain/cat";
import {
  ACHClass,
  PlaidErrorType,
  Products,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
  TransferNetwork,
  TransferType,
} from "plaid";
import client from "server/clients/plaidClient";
import { PLAID_COUNTRY_CODES, PLAID_PRODUCTS } from "server/constants";
import { createCatWithoutTxInput } from "server/domains/cat";
import { txInclude } from "server/domains/tx";
import db from "server/util/db";

export class PlaidBankService implements IBankService {
  private convertPlaidTransaction(tx: Transaction): BankTransaction {
    return {
      id: tx.transaction_id,
      accountId: tx.account_id,
      amount: tx.amount,
      date: tx.date,
      name: tx.name,
      merchantName: tx.merchant_name,
      pending: tx.pending,
      category: tx.personal_finance_category
        ? {
            primary: tx.personal_finance_category.primary,
            detailed: tx.personal_finance_category.detailed,
          }
        : null,
      paymentChannel: tx.payment_channel,
      authorizedDate: tx.authorized_date,
      logoUrl: tx.logo_url,
      isoCurrencyCode: tx.iso_currency_code,
      location: tx.location
        ? {
            address: tx.location.address,
            city: tx.location.city,
            region: tx.location.region,
            postalCode: tx.location.postal_code,
            country: tx.location.country,
          }
        : null,
      raw: tx,
    };
  }

  async createConnectionIntent(userId: string): Promise<string> {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "Nedon",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    });
    return response.data.link_token;
  }

  async establishConnection(userId: string): Promise<Result<void, unknown>> {
    try {
      console.log(`Creating public token for user ${userId} in sandbox...`);
      const publicTokenCreateResponse = await client.sandboxPublicTokenCreate({
        institution_id: "ins_109508",
        initial_products: PLAID_PRODUCTS,
      });

      if (publicTokenCreateResponse.status !== 200) {
        console.error(
          "Error creating public token:",
          publicTokenCreateResponse,
        );
        throw new Error(JSON.stringify(publicTokenCreateResponse, null, 2));
      }

      const publicToken = publicTokenCreateResponse.data.public_token;

      const exchangeResponse = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      if (exchangeResponse.status !== 200) {
        console.error("Error exchanging public token:", exchangeResponse);
        throw new Error(JSON.stringify(exchangeResponse, null, 2));
      }

      let transferId: string | null = null;
      if (PLAID_PRODUCTS.includes(Products.Transfer)) {
        transferId = await this.authorizeAndCreateTransfer(
          exchangeResponse.data.access_token,
        );

        if (!transferId) {
          throw new Error("Transfer ID is null");
        }
      }

      // Save tokens directly to DB, abstracting away from the router
      await db.user.update({
        where: { id: userId },
        data: {
          bankAccessToken: exchangeResponse.data.access_token,
        },
      });

      return { ok: true, value: undefined };
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(
          "Axios error in establishConnection:",
          e.response?.data.display_message,
        );
        return { ok: false, error: e.response?.data.display_message };
      }
      console.error("Unexpected error in establishConnection:", e);
      return { ok: false, error: e };
    }
  }

  private async authorizeAndCreateTransfer(accessToken: string) {
    const accountsGetResponse = await client.accountsGet({
      access_token: accessToken,
    });
    const accountId = accountsGetResponse.data.accounts[0].account_id;

    const transferAuthorizationResponse =
      await client.transferAuthorizationCreate({
        access_token: accessToken,
        account_id: accountId,
        type: TransferType.Credit,
        network: TransferNetwork.Ach,
        amount: "1.34",
        ach_class: ACHClass.Ppd,
        user: {
          legal_name: "FirstName LastName",
          email_address: "foobar@email.com",
          address: {
            street: "123 Main St.",
            city: "San Francisco",
            region: "CA",
            postal_code: "94053",
            country: "US",
          },
        },
      });

    const authorizationId = transferAuthorizationResponse.data.authorization.id;

    const transferResponse = await client.transferCreate({
      idempotency_key: "1223abc456xyz7890001",
      access_token: accessToken,
      account_id: accountId,
      authorization_id: authorizationId,
      type: TransferType.Credit,
      network: TransferNetwork.Ach,
      amount: "12.34",
      description: "Payment",
      ach_class: ACHClass.Ppd,
      user: {
        legal_name: "FirstName LastName",
        email_address: "foobar@email.com",
        address: {
          street: "123 Main St.",
          city: "San Francisco",
          region: "CA",
          postal_code: "94053",
          country: "US",
        },
      },
    });

    return transferResponse.data.transfer.id;
  }

  async getAccounts(userId: string): Promise<{ accounts: BankAccount[] }> {
    const user = await db.user.findFirst({
      where: { id: userId },
      select: { bankAccessToken: true },
    });

    if (!user || !user.bankAccessToken) {
      throw new Error("User or access token not found");
    }

    const authResponse = await client.authGet({
      access_token: user.bankAccessToken,
    });

    if (authResponse.status !== 200) {
      throw new Error(authResponse.statusText);
    }

    return {
      accounts: authResponse.data.accounts.map((acc) => ({
        id: acc.account_id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
        subtype: acc.subtype,
        balances: {
          available: acc.balances.available,
          current: acc.balances.current,
          limit: acc.balances.limit,
          isoCurrencyCode: acc.balances.iso_currency_code,
        },
        raw: acc,
      })),
    };
  }

  async syncTransactions(
    userId: string,
    dateString: string,
  ): Promise<Result<void, unknown>> {
    const user = await db.user.findFirst({ where: { id: userId } });
    if (!user) {
      return { ok: false, error: `No user found with id: ${userId}` };
    }
    if (!user.bankAccessToken) {
      return { ok: false, error: "User is not connected to a bank" };
    }

    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    let removed: RemovedTransaction[] = [];
    let totalCount = 100;
    let hasMore = true;
    let cursor = user.bankSyncToken || undefined;

    while (hasMore && totalCount > 0) {
      const request: TransactionsSyncRequest = {
        access_token: user.bankAccessToken,
        cursor: cursor,
        count: totalCount,
      };

      try {
        console.log(
          `syncing ${request.count} transactions with cursor ${request.cursor} and accessToken ${request.access_token}`,
        );
        const response = await client.transactionsSync(request);
        const data = response.data;

        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        totalCount =
          totalCount -
          data.added.length -
          data.modified.length -
          data.removed.length;

        hasMore = data.has_more;
        cursor = data.next_cursor;
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(
            "Axios error in transactionsSync: ",
            error.response?.data,
          );

          if (
            error.response?.data.error_type === PlaidErrorType.TransactionsError
          ) {
            switch (error.response?.data.error_code) {
              case "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION":
                console.error(
                  "Error: Transactions data has changed during pagination. Restarting sync.",
                );
                cursor = undefined;
                added = [];
                modified = [];
                removed = [];
                totalCount = 100;
                hasMore = true;
                continue;
            }
          }
        } else {
          console.error("Error in transactionsSync: ", error);
          return { ok: false, error };
        }
      }
    }

    try {
      // 1. Process all removed transactions first
      for (const plaidTx of removed) {
        if (!plaidTx.transaction_id) continue;
        await db.tx.deleteMany({
          where: {
            bankId: plaidTx.transaction_id,
          },
        });
      }

      const upsertedPlaidTxs = [...added, ...modified];
      const upserted = upsertedPlaidTxs.map((tx) =>
        this.convertPlaidTransaction(tx),
      );

      // 2. Process all upserted transactions
      for (const bankTx of upserted) {
        const existingTx = await db.tx.findFirst({
          where: {
            bankId: bankTx.id,
          },
        });

        if (!existingTx) {
          // newly added txs gets created
          const id = createId();
          const catArrayCreate: Prisma.CatCreateNestedManyWithoutTxInput =
            bankTx.category
              ? {
                  create: [
                    createCatWithoutTxInput(
                      convertPlaidCatToCat(
                        {
                          primary: bankTx.category.primary,
                          detailed: bankTx.category.detailed || "",
                        },
                        id,
                        Prisma.Decimal(bankTx.amount),
                      ),
                    ),
                  ],
                }
              : { create: [] };

          await db.tx.create({
            data: {
              id,
              name: bankTx.merchantName || bankTx.name,
              amount: Prisma.Decimal(bankTx.amount),
              recurring: false,
              mds: MdsType.UNDETERMINED,
              userTotal: Prisma.Decimal(0),
              originTxId: null,
              datetime: bankTx.date ? new Date(bankTx.date) : null,
              authorizedDatetime: new Date(bankTx.authorizedDate || 0),
              bankId: bankTx.id,
              accountId: bankTx.accountId,
              ownerId: userId,
              catArray: catArrayCreate,
              logoUrl: bankTx.logoUrl,
              isoCurrencyCode: bankTx.isoCurrencyCode,
              locationAddress: bankTx.location?.address,
              locationCity: bankTx.location?.city,
              locationRegion: bankTx.location?.region,
              locationPostalCode: bankTx.location?.postalCode,
              locationCountry: bankTx.location?.country,
            },
          });
        } else {
          // modified txs gets updated
          const cat = bankTx.category
            ? convertPlaidCatToCat(
                {
                  primary: bankTx.category.primary,
                  detailed: bankTx.category.detailed || "",
                },
                existingTx.id,
                Prisma.Decimal(0),
              )
            : undefined;

          await db.tx.update({
            where: {
              id: existingTx.id,
            },
            data: {
              bankId: existingTx.bankId || undefined,
              name: bankTx.merchantName || bankTx.name,
              amount: Prisma.Decimal(bankTx.amount),
              datetime: bankTx.date ? new Date(bankTx.date) : null,
              authorizedDatetime: new Date(bankTx.authorizedDate || 0),
              accountId: bankTx.accountId,
              catArray: {
                deleteMany: {},
                create: cat,
              },
              logoUrl: bankTx.logoUrl,
              isoCurrencyCode: bankTx.isoCurrencyCode,
              locationAddress: bankTx.location?.address,
              locationCity: bankTx.location?.city,
              locationRegion: bankTx.location?.region,
              locationPostalCode: bankTx.location?.postalCode,
              locationCountry: bankTx.location?.country,
            },
          });
        }
      }

      // Update user cursor
      await db.user.update({
        where: { id: userId },
        data: { bankSyncToken: cursor },
      });

      return { ok: true, value: undefined };
    } catch (error) {
      if (error instanceof PrismaClientValidationError) {
        console.log("Validation error in creating tx: ", error.message);
        return { ok: false, error: "Validation error" };
      }

      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case "P2002":
            console.log(error.message);
            break;
          default:
            console.log("Error in creating tx: ", error);
            return { ok: false, error };
        }
      }

      console.error("Unknown error in creating tx: ", error);
      return { ok: false, error };
    }
  }
}
