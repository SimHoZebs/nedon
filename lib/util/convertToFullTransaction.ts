import { Transaction } from "@prisma/client";
import { FullTransaction, PlaidTransaction, SplitClientSide } from "./types";
import { emptyCategory } from "./category";

const convertToFullTransaction = (
  userId: string,
  plaidTransaction: PlaidTransaction,
  transactionInDB?: Transaction & { splitArray: SplitClientSide[] }
): FullTransaction => {
  const { category, transaction_id, ...rest } = plaidTransaction;

  return {
    ...rest,
    id: transaction_id,
    ownerId: userId,
    inDB: !!transactionInDB,
    splitArray: transactionInDB?.splitArray || [
      {
        id: null,
        transactionId: plaidTransaction.transaction_id,
        categoryArray: [
          emptyCategory({
            nameArray: plaidTransaction.category || [],
            splitId: null,
            amount: plaidTransaction.amount,
          }),
        ],
        userId,
      },
    ],
  };
};

export default convertToFullTransaction;
