import type { SplitClientSide } from "@/types/split";

import type { Prisma } from "@prisma/client";

//Q. In what scenario would a split be created without a txId?
//A. When new txs are found from plaid, they are converted to txs and splits are created for them.
//The txId is not known at this point, so the txId is set to null.
//The txId is set when the tx is created in the db.
export const createNewSplit = (
  userId: string,
  amount: Prisma.Decimal,
  txId?: string,
): SplitClientSide => {
  return {
    userId,
    txId: txId || null,
    amount,
  };
};
