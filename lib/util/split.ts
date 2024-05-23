import type { Transaction } from "plaid";

import type { SplitClientSide } from "./types";

export const createNewSplit = (
  userId: string,
  plaidTx: Transaction,
): SplitClientSide => {
  return {
    userId: userId,
    txId: null,
    amount: plaidTx.amount,
  };
};
