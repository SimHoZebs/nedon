import type { TxFormState } from "@/types/tx";

import { createId } from "@paralleldrive/cuid2";
import { MdsType, TxKind } from "@prisma/client";
import type { Transaction } from "plaid";
import { plaidCategories } from "server/util/plaidCategories";

export function mapPlaidTransactionToTxFormState(
  tx: Transaction,
  userId: string,
): TxFormState {
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

  const id = createId();

  return {
    id,
    kind: TxKind.ORIGINAL,
    name: tx.merchant_name || tx.name,
    amount: tx.amount,
    recurring: false,
    mds: MdsType.UNDETERMINED,
    userTotal: 0,
    originTxId: null,
    originalBankTxId: null,
    datetime: tx.date ? new Date(tx.date) : null,
    authorizedDatetime: new Date(tx.authorized_date || 0),
    bankId: tx.transaction_id,
    accountId: tx.account_id,
    ownerId: userId,
    splitTxArray: [],
    receipt: null,
    catArray: tx.personal_finance_category
      ? [
          {
            primary: primary || "",
            detailed: detailed || "",
            description: description,
            amount: tx.amount,
            txId: id,
          },
        ]
      : [],
    logoUrl: tx.logo_url || null,
    isoCurrencyCode: tx.iso_currency_code || null,
    locationAddress: tx.location?.address || null,
    locationCity: tx.location?.city || null,
    locationRegion: tx.location?.region || null,
    locationPostalCode: tx.location?.postal_code || null,
    locationCountry: tx.location?.country || null,
  };
}
