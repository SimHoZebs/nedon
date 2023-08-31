import { Transaction } from "@prisma/client";

import { fillArrayByCategory, mergeCategoryArray } from "./category";
import { emptyCategory } from "./category";
import {
  FullTransaction,
  PlaidTransaction,
  SplitClientSide,
  TreedCategoryWithTransaction,
} from "./types";

export const resetFullTransaction = (
  fullTransaction: FullTransaction,
): FullTransaction => ({
  ...fullTransaction,
  id: null,
  splitArray: [
    {
      id: null,
      userId: fullTransaction.ownerId,
      transactionId: null,
      categoryArray: [
        {
          id: null,
          splitId: null,
          nameArray: fullTransaction.category || [],
          amount: fullTransaction.amount,
        },
      ],
    },
  ],
});

export const convertToFullTransaction = (
  userId: string,
  plaidTransaction: PlaidTransaction,
  transactionInDB?: Transaction & { splitArray: SplitClientSide[] },
): FullTransaction => {
  return {
    ...plaidTransaction,
    id: transactionInDB?.id || null,
    ownerId: userId,
    splitArray: transactionInDB?.splitArray || [
      {
        id: null,
        userId,
        transactionId: null,
        categoryArray: [
          emptyCategory({
            nameArray: plaidTransaction.category || [],
            splitId: null,
            amount: plaidTransaction.amount,
          }),
        ],
      },
    ],
  };
};

export const organizeTransactionByCategory = (
  transactionArray: FullTransaction[],
) => {
  const categoryArray: TreedCategoryWithTransaction[] = [];

  transactionArray.forEach((transaction) => {
    const transactionCopy = structuredClone(transaction);
    const mergedCategoryArray = mergeCategoryArray(transactionCopy.splitArray);
    mergedCategoryArray.forEach((category) => {
      fillArrayByCategory(categoryArray, transactionCopy, category);
    });
  });

  return categoryArray;
};

export const organizeTransactionByTime = (
  transactionArray: FullTransaction[],
) => {
  const transactionSortedByTimeArray = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
  );
  const transactionOrganizedByTimeArray: FullTransaction[][][][] = [[[[]]]];

  let lastDate: Date | undefined = undefined;
  let yearIndex = -1;
  let monthIndex = -1;
  let dateIndex = -1;

  transactionSortedByTimeArray.forEach((transaction, i) => {
    const date = new Date(transaction.date);
    if (!lastDate) {
      yearIndex++;
      monthIndex++;
      dateIndex++;
      lastDate = date;
    }

    //other indexs are resetted because the other ifs are guaranteed to be true.
    if (lastDate.getFullYear() !== date.getFullYear()) {
      yearIndex++;
      monthIndex = -1;
      transactionOrganizedByTimeArray[yearIndex] = [];
    }
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dateIndex = -1;
      transactionOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
    if (lastDate.getDate() !== date.getDate()) {
      dateIndex++;
      transactionOrganizedByTimeArray[yearIndex][monthIndex][dateIndex] = [];
    }

    transactionOrganizedByTimeArray[yearIndex][monthIndex][dateIndex].push(
      transaction,
    );

    lastDate = date;
  });

  return transactionOrganizedByTimeArray;
};

export const filterTransactionByDate = (
  transactionArray: FullTransaction[],
  date: Date,
  rangeFormat: "year" | "month" | "date",
) => {
  return transactionArray.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    let isMatch = false;

    isMatch = transactionDate.getFullYear() === date.getFullYear();
    if (rangeFormat === "year" || !isMatch) return isMatch;
    isMatch = transactionDate.getMonth() === date.getMonth();
    if (rangeFormat === "month" || !isMatch) return isMatch;
    isMatch = transactionDate.getDate() === date.getDate();
    return isMatch;
  });
};
