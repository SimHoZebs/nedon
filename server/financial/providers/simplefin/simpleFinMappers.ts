import type { ExternalAccount, ExternalTransaction } from "../../types";
import type { SimpleFinAccountSet } from "./simpleFinSchemas";

import Decimal from "decimal.js";

export function mapSimpleFinAccounts(
  data: SimpleFinAccountSet,
): ExternalAccount[] {
  return data.accounts.map((account) => ({
    externalId: `${account.conn_id}:${account.id}`,
    name: account.name,
    mask: null,
    type: "unknown",
    subtype: null,
    currentBalance: new Decimal(account.balance).toString(),
    availableBalance: account["available-balance"]
      ? new Decimal(account["available-balance"]).toString()
      : null,
    currency: account.currency,
    balanceDate: new Date(account["balance-date"] * 1000),
  }));
}

export function mapSimpleFinTransactions(
  data: SimpleFinAccountSet,
): ExternalTransaction[] {
  return data.accounts.flatMap((account) =>
    account.transactions.map((transaction) => {
      const pending = transaction.pending === true || transaction.posted === 0;
      const timestamp =
        transaction.transacted_at ||
        transaction.posted ||
        account["balance-date"];
      const category = transaction.extra?.category;
      return {
        externalId: transaction.id,
        externalAccountId: `${account.conn_id}:${account.id}`,
        name: transaction.description,
        amount: new Decimal(transaction.amount).negated().toString(),
        postedAt: transaction.posted
          ? new Date(transaction.posted * 1000)
          : null,
        authorizedAt: new Date(timestamp * 1000),
        pending,
        replacesExternalTransactionId: null,
        currency: account.currency,
        logoUrl: null,
        location: {
          address: null,
          city: null,
          region: null,
          postalCode: null,
          country: null,
        },
        categories:
          typeof category === "string"
            ? [
                {
                  primary: "SIMPLEFIN",
                  detailed: category,
                  description: category,
                },
              ]
            : [],
      };
    }),
  );
}
