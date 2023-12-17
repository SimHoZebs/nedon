import { Tx } from "@prisma/client";

import { fillArrayByCat, mergeCatArray } from "./cat";
import { emptyCat } from "./cat";
import { FullTx, PlaidTx, SplitClientSide, TreedCatWithTx } from "./types";

export const resetFullTx = (fullTx: FullTx): FullTx => ({
  ...fullTx,
  id: undefined,
  splitArray: [
    {
      id: undefined,
      userId: fullTx.ownerId,
      txId: undefined,
      catArray: [
        {
          id: undefined,
          splitId: undefined,
          nameArray: fullTx.category || [],
          amount: fullTx.amount,
        },
      ],
    },
  ],
});

export const convertToFullTx = (
  userId: string,
  plaidTx: PlaidTx,
  txInDB?: Tx & { splitArray: SplitClientSide[]; },
): FullTx => {
  return {
    ...plaidTx,
    id: txInDB?.id || undefined,
    ownerId: userId,
    splitArray: txInDB?.splitArray || [
      {
        id: undefined,
        userId,
        txId: undefined,
        catArray: [
          emptyCat({
            nameArray: plaidTx.category || [],
            splitId: undefined,
            amount: plaidTx.amount,
          }),
        ],
      },
    ],
  };
};

export const organizeTxByCat = (txArray: FullTx[]) => {
  const catArray: TreedCatWithTx[] = [];

  txArray.forEach((tx) => {
    const txCopy = structuredClone(tx);
    const mergedCatArray = mergeCatArray(txCopy.splitArray);
    mergedCatArray.forEach((cat) => {
      fillArrayByCat(catArray, txCopy, cat);
    });
  });

  return catArray;
};

export const organizeTxByTime = (txArray: FullTx[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
  );
  const txOrganizedByTimeArray: FullTx[][][][] = [[[[]]]];

  let lastDate: Date | undefined = undefined;
  let yearIndex = -1;
  let monthIndex = -1;
  let dateIndex = -1;

  txSortedByTimeArray.forEach((tx, i) => {
    const date = new Date(tx.date);
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
      txOrganizedByTimeArray[yearIndex] = [];
    }
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dateIndex = -1;
      txOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
    if (lastDate.getDate() !== date.getDate()) {
      dateIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex] = [];
    }

    txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex].push(tx);

    lastDate = date;
  });

  return txOrganizedByTimeArray;
};

export const filterTxByDate = (
  txArray: FullTx[],
  date: Date,
  rangeFormat: "year" | "month" | "date",
) => {
  return txArray.filter((tx) => {
    const txDate = new Date(tx.date);
    let isMatch = false;

    isMatch = txDate.getFullYear() === date.getFullYear();
    if (rangeFormat === "year" || !isMatch) return isMatch;
    isMatch = txDate.getMonth() === date.getMonth();
    if (rangeFormat === "month" || !isMatch) return isMatch;
    isMatch = txDate.getDate() === date.getDate();
    return isMatch;
  });
};
