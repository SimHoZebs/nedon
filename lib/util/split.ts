import type { SplitClientSide } from "@/types/split";

export const createNewSplit = (
  userId: string,
  amount: number,
  txId?: string,
): SplitClientSide => {
  return {
    userId,
    txId,
    amount,
  };
};
