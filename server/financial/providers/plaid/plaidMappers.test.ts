import { mapPlaidAccount, mapPlaidTransaction } from "./plaidMappers";

import type { AccountBase, Transaction } from "plaid";
import { describe, expect, test } from "vitest";

describe("Plaid normalization", () => {
  test("normalizes an account without exposing the raw response", () => {
    const account = {
      account_id: "account-1",
      name: "Checking",
      mask: "1234",
      type: "depository",
      subtype: "checking",
      balances: {
        current: 12.34,
        available: 10,
        limit: null,
        iso_currency_code: "USD",
        unofficial_currency_code: null,
      },
    } as AccountBase;

    expect(mapPlaidAccount(account)).toMatchObject({
      externalId: "account-1",
      currentBalance: "12.34",
      currency: "USD",
    });
  });

  test("preserves Nedon's positive-spending convention", () => {
    const transaction = {
      transaction_id: "transaction-1",
      account_id: "account-1",
      name: "Coffee",
      amount: 4.5,
      date: "2026-07-17",
      authorized_date: "2026-07-16",
      pending: false,
      pending_transaction_id: "pending-transaction",
      iso_currency_code: "USD",
      logo_url: null,
      location: {},
    } as Transaction;

    expect(mapPlaidTransaction(transaction)).toMatchObject({
      amount: "4.5",
      pending: false,
      replacesExternalTransactionId: "pending-transaction",
      authorizedAt: new Date("2026-07-16"),
    });
  });
});
