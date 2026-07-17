import { parseSimpleFinToken, SimpleFinClient } from "./SimpleFinClient";
import {
  mapSimpleFinAccounts,
  mapSimpleFinTransactions,
} from "./simpleFinMappers";
import { SimpleFinAccountSetSchema } from "./simpleFinSchemas";

import { describe, expect, test, vi } from "vitest";

const accountSet = SimpleFinAccountSetSchema.parse({
  errlist: [],
  connections: [],
  accounts: [
    {
      id: "account-1",
      name: "Checking",
      conn_id: "connection-1",
      currency: "USD",
      balance: "100.20",
      "available-balance": "90.10",
      "balance-date": 1_700_000_000,
      transactions: [
        {
          id: "transaction-1",
          posted: 1_700_000_000,
          amount: "-12.50",
          description: "Coffee",
        },
      ],
    },
  ],
});

describe("SimpleFIN", () => {
  test("decodes Setup Tokens and rejects invalid tokens", () => {
    const token = Buffer.from("https://example.com/claim").toString("base64");
    expect(parseSimpleFinToken(token).href).toBe("https://example.com/claim");
    expect(() => parseSimpleFinToken("not-a-url")).toThrow(
      "Invalid SimpleFIN Setup Token",
    );
  });

  test("rejects private-network claim URLs before fetching", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const client = new SimpleFinClient(fetcher);
    const token = Buffer.from("https://127.0.0.1/claim").toString("base64");
    await expect(client.claim(token)).rejects.toThrow("private network");
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("normalizes balances and reverses deposit-positive amounts", () => {
    expect(mapSimpleFinAccounts(accountSet)[0]).toMatchObject({
      currentBalance: "100.2",
      availableBalance: "90.1",
    });
    expect(mapSimpleFinTransactions(accountSet)[0]).toMatchObject({
      amount: "12.5",
      externalAccountId: "connection-1:account-1",
    });
  });

  test("scopes duplicate account IDs by SimpleFIN connection", () => {
    const duplicate = SimpleFinAccountSetSchema.parse({
      ...accountSet,
      accounts: [
        accountSet.accounts[0],
        { ...accountSet.accounts[0], conn_id: "connection-2" },
      ],
    });
    expect(
      mapSimpleFinAccounts(duplicate).map(({ externalId }) => externalId),
    ).toEqual(["connection-1:account-1", "connection-2:account-1"]);
  });

  test("requests protocol version 2 and accepts omitted transactions", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          errlist: [],
          connections: [],
          accounts: [
            {
              id: "account-1",
              name: "Checking",
              conn_id: "connection-1",
              currency: "USD",
              balance: "1",
              "balance-date": 1_700_000_000,
            },
          ],
        }),
      ),
    );
    const client = new SimpleFinClient(fetcher, async () => [
      { address: "203.0.113.10", family: 4 },
    ]);

    const result = await client.getAccounts(
      "https://user:secret@example.com/simplefin",
      new Date("2026-07-01"),
      new Date("2026-07-17"),
    );
    const requestedUrl = fetcher.mock.calls[0]?.[0];

    expect(requestedUrl?.toString()).toContain("version=2");
    expect(result.accounts[0]?.transactions).toEqual([]);
  });
});
