import { PlaidProvider } from "./PlaidProvider";

import type { PlaidApi } from "plaid";
import { describe, expect, test, vi } from "vitest";

describe("PlaidProvider", () => {
  test("restarts changed pagination from the original cursor", async () => {
    const transactionsSync = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          added: [],
          modified: [],
          removed: [],
          has_more: true,
          next_cursor: "page-two",
        },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error_type: "TRANSACTIONS_ERROR",
            error_code: "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION",
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          added: [],
          modified: [],
          removed: [],
          has_more: false,
          next_cursor: "final",
        },
      });
    const plaid = {
      accountsGet: vi.fn().mockResolvedValue({ data: { accounts: [] } }),
      transactionsSync,
    } as unknown as PlaidApi;

    const result = await new PlaidProvider(plaid).sync({
      credential: "secret",
      checkpoint: "original",
      startDate: new Date("2026-07-01"),
    });

    expect(
      transactionsSync.mock.calls.map(([request]) => request.cursor),
    ).toEqual(["original", "page-two", "original"]);
    expect(result.checkpoint).toBe("final");
  });
});
