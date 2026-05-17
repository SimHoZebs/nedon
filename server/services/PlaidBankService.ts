import type { Result } from "@/util/type";

import type {
  GenericAccount,
  GenericBankTransaction,
  GenericRemovedBankTransaction,
  IBankService,
} from "./IBankService";

import { isAxiosError } from "axios";
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

export class PlaidBankService implements IBankService {
  private convertPlaidTransaction(tx: Transaction): GenericBankTransaction {
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
      raw: tx, // Include original data for backward compatibility or future use
    };
  }

  async createLinkToken(): Promise<string> {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: "user-id",
      },
      client_name: "Plaid Quickstart",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    });
    return response.data.link_token;
  }

  async getTokensAndIds(): Promise<
    Result<
      {
        publicToken: string;
        accessToken: string;
        itemId: string;
        transferId: string | null;
      },
      unknown
    >
  > {
    try {
      console.log("Creating public token...");
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

      return {
        ok: true,
        value: {
          publicToken,
          accessToken: exchangeResponse.data.access_token,
          itemId: exchangeResponse.data.item_id,
          transferId: transferId,
        },
      };
    } catch (e) {
      if (isAxiosError(e)) {
        console.error(
          "Axios error in getTokensAndIds:",
          e.response?.data.display_message,
        );
        return { ok: false, error: e.response?.data.display_message };
      }
      console.error("Unexpected error in getTokensAndIds:", e);
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

  async getAuth(accessToken: string): Promise<{ accounts: GenericAccount[] }> {
    const authResponse = await client.authGet({
      access_token: accessToken,
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
        raw: acc, // Include original data for backward compatibility
      })),
    };
  }

  async getTxSyncData(accessToken: string, cursor?: string) {
    // New tx updates since "cursor"
    let added: Transaction[] = [];
    let modified: Transaction[] = [];
    // Removed tx ids
    let removed: RemovedTransaction[] = [];
    let totalCount = 100;
    let hasMore = true;

    while (hasMore && totalCount > 0) {
      const request: TransactionsSyncRequest = {
        access_token: accessToken,
        cursor: cursor,
        count: totalCount,
      };

      try {
        console.log(
          `syncing ${request.count} transactions with cursor ${request.cursor} and accessToken ${request.access_token}`,
        );
        const response = await client.transactionsSync(request);
        const data = response.data;
        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);
        totalCount =
          totalCount -
          data.added.length -
          data.modified.length -
          data.removed.length;

        hasMore = data.has_more;

        // Update cursor to the next cursor
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
          return null;
        }
      }
    }

    return {
      added: added.map((tx) => this.convertPlaidTransaction(tx)),
      modified: modified.map((tx) => this.convertPlaidTransaction(tx)),
      removed: removed.map((tx) => ({
        id: tx.transaction_id || "",
        raw: tx,
      })),
      cursor,
    };
  }
}
