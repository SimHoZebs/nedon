import parseMoney from "./parseMoney";
import { SplitClientSide } from "./types";

export const calcSplitAmount = (split: SplitClientSide) => {
  return split.catArray.reduce(
    (total, cat) => parseMoney(total + cat.amount),
    0,
  );
};
