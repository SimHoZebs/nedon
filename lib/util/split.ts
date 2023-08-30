import parseMoney from "./parseMoney";
import { SplitClientSide } from "./types";

export const calcSplitAmount = (split: SplitClientSide) => {
  return split.categoryArray.reduce(
    (total, category) => parseMoney(total + category.amount),
    0,
  );
};
