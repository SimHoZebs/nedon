import type { UnsavedCat } from "@/types/cat";
import type { Tx } from "@/types/tx";

import { Prisma } from "@prisma/client";
import type { PersonalFinanceCategory } from "plaid";
import { plaidCategories } from "server/util/plaidCategories";

export const createNewCat = (input: UnsavedCat): UnsavedCat => {
  return {
    ...input,
    id: undefined,
  };
};

export const getCatStyle = (primary: string, detailed: string) => {
  const defaultStyle = {
    name: "UNDEFINED",
    bgColor: "bg-gray-300",
    textColor: "text-gray-800",
    icon: "",
    border: "border-gray-300",
  };

  if (
    !(primary in plaidCategories) ||
    !(detailed in plaidCategories[primary])
  ) {
    return defaultStyle;
  }

  return {
    name: plaidCategories[primary][detailed].name,
    bgColor: plaidCategories[primary][detailed].bgColor,
    textColor: plaidCategories[primary][detailed].textColor,
    icon: plaidCategories[primary][detailed].icon,
    border: plaidCategories[primary][detailed]?.border,
  };
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
  const { confidence_level: _c, version: _v, ...rest } = plaidCat;

  if (!(plaidCat.primary in plaidCategories)) {
  }

  return createNewCat({
    ...rest,
    description:
      plaidCategories[plaidCat.primary || ""][plaidCat.detailed || ""]
        ?.description || "UNDEFINED",
    txId,
    amount: amount ? amount : Prisma.Decimal(0),
  });
};
