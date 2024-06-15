import type { Transaction } from "plaid";

import { emptyCat, fillArrayByCat } from "./cat";
import { createNewSplit } from "./split";
import type { FullTxClientSide, TreedCatWithTx, TxInDB } from "./types";

export const resetFullTx = (fullTx: FullTxClientSide): FullTxClientSide => ({
  ...fullTx,
  id: undefined,
});

export const convertToFullTx = (
  userId: string,
  plaidTx: Transaction,
  txInDB?: TxInDB,
): FullTxClientSide => {
  return {
    ...plaidTx,
    id: txInDB?.id,
    userTotal: txInDB?.userTotal || 0,
    originTxId: txInDB?.originTxId || null,
    plaidId: txInDB?.plaidId || plaidTx.transaction_id,
    userId: userId,
    catArray: txInDB?.catArray || [
      emptyCat({ nameArray: plaidTx.category || [], amount: plaidTx.amount }),
    ],
    splitArray: txInDB?.splitArray || [createNewSplit(userId, plaidTx)],
  };
};

export const organizeTxByCat = (txArray: FullTxClientSide[]) => {
  const catArray: TreedCatWithTx[] = [];

  for (const tx of txArray) {
    const txCopy = structuredClone(tx);

    for (const cat of txCopy.catArray) {
      fillArrayByCat(catArray, txCopy, cat);
    }
  }

  return catArray;
};

export const organizeTxByTime = (txArray: FullTxClientSide[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
  );
  const txOrganizedByTimeArray: FullTxClientSide[][][][] = [[[[]]]];

  let lastDate: Date | undefined = undefined;
  let yearIndex = -1;
  let monthIndex = -1;
  let dateIndex = -1;

  for (const tx of txSortedByTimeArray) {
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
  }

  return txOrganizedByTimeArray;
};

export const filterTxByDate = (
  txArray: FullTxClientSide[],
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

export const txTypeArray: ["spending", "received", "transfers"] = [
  "spending",
  "received",
  "transfers",
];

export type TxType = (typeof txTypeArray)[number];
