import { SplitClientSide } from "./types";

export const calcSplitAmount = (split: SplitClientSide) => {
  return split.categoryArray.reduce(
    (total, category) => total + category.amount,
    0
  );
};
