import { FinancialSyncService } from "./FinancialSyncService";
import type { ProviderSyncResult } from "./types";

import type { PrismaClient } from "@prisma/client";
import { describe, expect, test, vi } from "vitest";

function createDatabase() {
  const transaction = {
    $executeRaw: vi.fn().mockResolvedValue(1),
    financialAccount: {
      upsert: vi.fn().mockResolvedValue({ id: "account-id" }),
    },
    financialConnection: { update: vi.fn().mockResolvedValue({}) },
    tx: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: "original-id" })
        .mockResolvedValue({ id: "editable-id" }),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  };
  const database = {
    $transaction: vi.fn(
      async (callback: (client: typeof transaction) => Promise<void>) =>
        callback(transaction),
    ),
  } as unknown as PrismaClient;
  return { database, transaction };
}

const account = {
  externalId: "external-account",
  name: "Checking",
  mask: null,
  type: "depository",
  subtype: "checking",
  currentBalance: "100",
  availableBalance: "90",
  currency: "USD",
  balanceDate: null,
};

describe("FinancialSyncService", () => {
  test("creates one imported original and one editable copy atomically", async () => {
    const { database, transaction } = createDatabase();
    const service = new FinancialSyncService(database);
    const sync = {
      mode: "delta",
      accounts: [account],
      upserted: [
        {
          externalId: "external-transaction",
          externalAccountId: account.externalId,
          name: "Coffee",
          amount: "4.5",
          postedAt: new Date("2026-07-17"),
          authorizedAt: new Date("2026-07-16"),
          pending: false,
          replacesExternalTransactionId: null,
          currency: "USD",
          logoUrl: null,
          location: {
            address: null,
            city: null,
            region: null,
            postalCode: null,
            country: null,
          },
          categories: [],
        },
      ],
      removed: [],
      checkpoint: "cursor",
    } satisfies ProviderSyncResult;

    await service.apply("connection-id", "owner-id", sync);

    expect(transaction.tx.create).toHaveBeenCalledTimes(2);
    expect(transaction.tx.create).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          originalBankTxId: "original-id",
          externalTransactionId: null,
        }),
      }),
    );
    expect(transaction.financialConnection.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ checkpoint: "cursor" }),
      }),
    );
  });

  test("does not infer removals from an incomplete snapshot", async () => {
    const { database, transaction } = createDatabase();
    const service = new FinancialSyncService(database);
    await service.apply("connection-id", "owner-id", {
      mode: "snapshot",
      accounts: [account],
      transactions: [],
      observedFrom: new Date("2026-07-01"),
      observedTo: new Date("2026-07-17"),
      complete: false,
      checkpoint: "2026-07-17T00:00:00.000Z",
    });

    expect(transaction.tx.findMany).not.toHaveBeenCalled();
    expect(transaction.tx.deleteMany).not.toHaveBeenCalled();
  });
});
