import { transactionCategories } from "../../../../lib/domain/transactionCategories";
import { normalizeMoneyValue } from "../../../mappers/prismaToDto";
import type { ExternalAccount, ExternalTransaction } from "../../types";

import type { AccountBase, Transaction } from "plaid";

export function mapPlaidAccount(account: AccountBase): ExternalAccount {
  return {
    externalId: account.account_id,
    name: account.name,
    mask: account.mask,
    type: account.type,
    subtype: account.subtype,
    currentBalance:
      account.balances.current === null
        ? null
        : normalizeMoneyValue(account.balances.current),
    availableBalance:
      account.balances.available === null
        ? null
        : normalizeMoneyValue(account.balances.available),
    currency: account.balances.iso_currency_code,
    balanceDate: null,
  };
}

export function mapPlaidTransaction(
  transaction: Transaction,
): ExternalTransaction {
  const primary = transaction.personal_finance_category?.primary;
  const detailed = transaction.personal_finance_category?.detailed;
  const knownCategory =
    primary &&
    detailed &&
    primary in transactionCategories &&
    detailed in transactionCategories[primary]
      ? transactionCategories[primary][detailed]
      : null;

  return {
    externalId: transaction.transaction_id,
    externalAccountId: transaction.account_id,
    name: transaction.merchant_name || transaction.name,
    amount: normalizeMoneyValue(transaction.amount),
    postedAt: transaction.date ? new Date(transaction.date) : null,
    authorizedAt: new Date(
      transaction.authorized_datetime ||
        transaction.authorized_date ||
        transaction.datetime ||
        transaction.date,
    ),
    pending: transaction.pending,
    replacesExternalTransactionId: transaction.pending_transaction_id || null,
    currency: transaction.iso_currency_code || null,
    logoUrl: transaction.logo_url || null,
    location: {
      address: transaction.location?.address || null,
      city: transaction.location?.city || null,
      region: transaction.location?.region || null,
      postalCode: transaction.location?.postal_code || null,
      country: transaction.location?.country || null,
    },
    categories:
      primary && detailed
        ? [
            {
              primary,
              detailed,
              description: knownCategory?.description || "UNDEFINED",
            },
          ]
        : [],
  };
}
