import type { UnsavedCat } from "@/types/cat";
import type { Tx } from "@/types/tx";

import catStyleArray from "../util/catStyle";

import { Prisma } from "@prisma/client";
import type { PersonalFinanceCategory } from "plaid";
import { plaidCategories } from "server/util/plaidCategories";

export const createNewCat = (input: UnsavedCat): UnsavedCat => {
  return {
    ...input,
    id: undefined,
  };
};

export const getCatStyle = (detailedCat: string) => {
  const style = catStyleArray[detailedCat];
  return style ? style : catStyleArray.Unknown;
};

export const resetCatArray = (tx: Tx): UnsavedCat[] => {
  return tx.plaidTx?.personal_finance_category
    ? [convertPlaidCatToCat(tx.plaidTx.personal_finance_category, tx.id)]
    : [];
};

export const convertPlaidCatToCat = (
  plaidCat: PersonalFinanceCategory,
  txId: string,
  amount?: Prisma.Decimal,
): UnsavedCat => {
  return createNewCat({
    ...plaidCat,
    description:
      plaidCategories[plaidCat.primary || ""][plaidCat.detailed || ""]
        ?.description || "UNDEFINED",
    txId,
    amount: amount ? amount : Prisma.Decimal(0),
  });
};
