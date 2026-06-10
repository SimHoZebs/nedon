import type { CatFormState } from "@/types/cat";

import { plaidCategories } from "server/util/plaidCategories";

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
