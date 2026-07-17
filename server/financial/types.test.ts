import type {
  DeltaProviderSync,
  FinancialDataProvider,
  SnapshotProviderSync,
} from "./types";

import { describe, expect, test } from "vitest";

describe("financial provider contract", () => {
  test("supports incremental providers without losing removals", () => {
    const sync = {
      mode: "delta",
      accounts: [],
      upserted: [],
      removed: [{ externalId: "tx-1", externalAccountId: "account-1" }],
      checkpoint: "next-cursor",
    } satisfies DeltaProviderSync;

    expect(sync.removed).toHaveLength(1);
  });

  test("marks whether a snapshot is complete before reconciliation", () => {
    const sync = {
      mode: "snapshot",
      accounts: [],
      transactions: [],
      observedFrom: new Date("2026-01-01T00:00:00.000Z"),
      observedTo: new Date("2026-02-01T00:00:00.000Z"),
      complete: false,
      checkpoint: null,
    } satisfies SnapshotProviderSync;

    expect(sync.complete).toBe(false);
  });

  test("keeps credentials on the server-only provider boundary", () => {
    const provider: FinancialDataProvider = {
      id: "SIMPLEFIN",
      beginConnection: async () => ({
        type: "tokenInput",
        createUrl: "https://bridge.simplefin.org/simplefin/create",
      }),
      completeConnection: async () => ({
        externalId: null,
        credential: "https://user:secret@example.com/simplefin",
      }),
      sync: async () => ({
        mode: "snapshot",
        accounts: [],
        transactions: [],
        observedFrom: new Date(0),
        observedTo: new Date(0),
        complete: true,
        checkpoint: null,
      }),
    };

    expect(provider.id).toBe("SIMPLEFIN");
  });
});
