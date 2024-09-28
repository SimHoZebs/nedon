import type { SplitClientSide } from "@/types/split";

export const createNewSplit = (
  userId: string,
  amount: number,
): SplitClientSide => {
  return {
    userId,
    txId: null,
    amount,
  };
};
