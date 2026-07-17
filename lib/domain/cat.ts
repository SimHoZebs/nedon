import type { CatFormState } from "@/types/cat";

import { transactionCategories } from "./transactionCategories";

export const createNewCat = (input: CatFormState): CatFormState => {
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
    !(primary in transactionCategories) ||
    !(detailed in transactionCategories[primary])
  ) {
    return defaultStyle;
  }

  return {
    name: transactionCategories[primary][detailed].name,
    bgColor: transactionCategories[primary][detailed].bgColor,
    textColor: transactionCategories[primary][detailed].textColor,
    icon: transactionCategories[primary][detailed].icon,
    border: transactionCategories[primary][detailed]?.border,
  };
};
