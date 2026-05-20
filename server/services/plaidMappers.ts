import type { BankTransaction } from "./IBankService";

import type { Transaction } from "plaid";
import { plaidCategories } from "server/util/plaidCategories";

export function mapPlaidTransactionToBankTransaction(
  tx: Transaction,
): BankTransaction {
  const primary = tx.personal_finance_category?.primary;
  const detailed = tx.personal_finance_category?.detailed;

  let description = "UNDEFINED";
  if (
    primary &&
    detailed &&
    primary in plaidCategories &&
    detailed in plaidCategories[primary]
  ) {
    description = plaidCategories[primary][detailed].description;
  }

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
          primary: primary || "",
          detailed: detailed || "",
          description: description,
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
