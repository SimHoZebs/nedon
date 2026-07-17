import db from "../util/db";
import type { ExternalTransaction, ProviderSyncResult } from "./types";

import { Prisma, TxKind } from "@prisma/client";

function transactionData(
  ownerId: string,
  accountId: string,
  transaction: ExternalTransaction,
): Prisma.TxUncheckedCreateInput {
  return {
    ownerId,
    financialAccountId: accountId,
    externalTransactionId: transaction.externalId,
    kind: TxKind.ORIGINAL,
    name: transaction.name,
    amount: new Prisma.Decimal(transaction.amount),
    userTotal: new Prisma.Decimal(0),
    datetime: transaction.postedAt,
    authorizedDatetime: transaction.authorizedAt,
    providerPending: transaction.pending,
    logoUrl: transaction.logoUrl,
    isoCurrencyCode: transaction.currency,
    locationAddress: transaction.location.address,
    locationCity: transaction.location.city,
    locationRegion: transaction.location.region,
    locationPostalCode: transaction.location.postalCode,
    locationCountry: transaction.location.country,
    catArray: {
      create: transaction.categories.map((category) => ({
        ...category,
        amount: new Prisma.Decimal(transaction.amount),
      })),
    },
  };
}

export class FinancialSyncService {
  constructor(private readonly database = db) {}

  async apply(
    connectionId: string,
    ownerId: string,
    sync: ProviderSyncResult,
  ): Promise<void> {
    await this.database.$transaction(async (transaction) => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${connectionId}))`;
      const accountIds = new Map<string, string>();

      for (const account of sync.accounts) {
        const persisted = await transaction.financialAccount.upsert({
          where: {
            connectionId_externalId: {
              connectionId,
              externalId: account.externalId,
            },
          },
          create: {
            connectionId,
            externalId: account.externalId,
            name: account.name,
            mask: account.mask,
            type: account.type,
            subtype: account.subtype,
            currentBalance: account.currentBalance,
            availableBalance: account.availableBalance,
            currency: account.currency,
            balanceDate: account.balanceDate,
          },
          update: {
            name: account.name,
            mask: account.mask,
            type: account.type,
            subtype: account.subtype,
            currentBalance: account.currentBalance,
            availableBalance: account.availableBalance,
            currency: account.currency,
            balanceDate: account.balanceDate,
            active: true,
          },
          select: { id: true },
        });
        accountIds.set(account.externalId, persisted.id);
      }

      const upserted =
        sync.mode === "delta" ? sync.upserted : sync.transactions;
      for (const externalTransaction of upserted) {
        const accountId = accountIds.get(externalTransaction.externalAccountId);
        if (!accountId) {
          throw new Error(
            `Provider returned transaction ${externalTransaction.externalId} for unknown account ${externalTransaction.externalAccountId}`,
          );
        }

        if (externalTransaction.replacesExternalTransactionId) {
          await transaction.tx.updateMany({
            where: {
              financialAccountId: accountId,
              externalTransactionId:
                externalTransaction.replacesExternalTransactionId,
              kind: TxKind.ORIGINAL,
            },
            data: {
              externalTransactionId: externalTransaction.externalId,
            },
          });
        }

        const existing = await transaction.tx.findUnique({
          where: {
            financialAccountId_externalTransactionId: {
              financialAccountId: accountId,
              externalTransactionId: externalTransaction.externalId,
            },
          },
          select: { id: true },
        });
        const data = transactionData(ownerId, accountId, externalTransaction);

        if (!existing) {
          const original = await transaction.tx.create({ data });
          await transaction.tx.create({
            data: {
              ...data,
              kind: TxKind.USER,
              financialAccountId: accountId,
              externalTransactionId: null,
              originalBankTxId: original.id,
            },
          });
          continue;
        }

        const { catArray: _categories, ...scalarData } = data;
        await transaction.tx.update({
          where: { id: existing.id },
          data: {
            ...scalarData,
            catArray: {
              deleteMany: {},
              create: externalTransaction.categories.map((category) => ({
                ...category,
                amount: new Prisma.Decimal(externalTransaction.amount),
              })),
            },
          },
        });

        const editable = await transaction.tx.findFirst({
          where: { originalBankTxId: existing.id, kind: TxKind.USER },
          select: { id: true },
        });
        if (!editable) {
          await transaction.tx.create({
            data: {
              ...data,
              kind: TxKind.USER,
              externalTransactionId: null,
              originalBankTxId: existing.id,
            },
          });
        }
      }

      if (sync.mode === "delta") {
        for (const removed of sync.removed) {
          const accountId = removed.externalAccountId
            ? accountIds.get(removed.externalAccountId)
            : undefined;
          const original = await transaction.tx.findFirst({
            where: {
              externalTransactionId: removed.externalId,
              kind: TxKind.ORIGINAL,
              financialAccount: {
                connectionId,
                ...(accountId ? { id: accountId } : {}),
              },
            },
            select: { id: true },
          });
          if (!original) continue;
          await transaction.tx.deleteMany({
            where: { originalBankTxId: original.id },
          });
          await transaction.tx.delete({ where: { id: original.id } });
        }
      } else if (sync.complete) {
        for (const [externalAccountId, accountId] of accountIds) {
          const observedIds = sync.transactions
            .filter(
              (externalTransaction) =>
                externalTransaction.externalAccountId === externalAccountId,
            )
            .map((externalTransaction) => externalTransaction.externalId);
          const missingOriginals = await transaction.tx.findMany({
            where: {
              financialAccountId: accountId,
              kind: TxKind.ORIGINAL,
              OR: [
                { datetime: { gte: sync.observedFrom, lt: sync.observedTo } },
                {
                  providerPending: true,
                  authorizedDatetime: {
                    gte: sync.observedFrom,
                    lt: sync.observedTo,
                  },
                },
              ],
              externalTransactionId: { notIn: observedIds },
            },
            select: { id: true },
          });
          if (!missingOriginals.length) continue;
          const ids = missingOriginals.map(({ id }) => id);
          await transaction.tx.deleteMany({
            where: { originalBankTxId: { in: ids } },
          });
          await transaction.tx.deleteMany({ where: { id: { in: ids } } });
        }
      }

      await transaction.financialConnection.update({
        where: { id: connectionId },
        data: {
          checkpoint: sync.checkpoint,
          status: "ACTIVE",
          lastError: null,
          lastSyncSuccessAt: new Date(),
        },
      });
    });
  }
}

export const financialSyncService = new FinancialSyncService();
