import type { UnsavedCat } from "@/types/cat";
import type { Tx } from "@/types/tx";

import { Prisma } from "@prisma/client";
import type { PersonalFinanceCategory } from "plaid";
import { plaidCategories } from "server/util/plaidCategories";

export const createCatWithoutTxInput = (
  input: UnsavedCat,
): Prisma.CatCreateWithoutTxInput => {
  const { txId: _txId, ...rest } = input;
  return {
    ...rest,
    id: undefined,
  };
};

export const createNewCat = (
  input: UnsavedCat,
): Prisma.CatCreateWithoutTxInput => {
  return {
    ...input,
    id: undefined,
  };
};

export const getCatStyle = (primary: string, detailed: string) => {
  const defaultStyle = {
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
    bgColor: plaidCategories[primary][detailed].bgColor,
    textColor: plaidCategories[primary][detailed].textColor,
    icon: plaidCategories[primary][detailed].icon,
    borderColor: plaidCategories[primary][detailed]?.border,
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
