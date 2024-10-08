import type { Transaction } from "plaid";

import type { TreedCatWithTx } from "@/types/cat";
import type { TxInDB, UnsavedTx, UnsavedTxInDB } from "@/types/tx";

import { createNewCat, fillArrayByCat } from "./cat";
import { createNewSplit } from "./split";

export const resetTx = (tx: TxInDB): UnsavedTxInDB => ({
  ...tx,
  plaidTx: tx.plaidTx,
  splitArray: [createNewSplit(tx.userId, tx.amount, tx.id)],
  catArray: [
    createNewCat({
      nameArray: tx.plaidTx?.category || [],
      amount: tx.amount,
    }),
  ],
  receipt: null,
});

export const mergePlaidTxWithTx = (
  tx: TxInDB,
  plaidTx: Transaction,
): TxInDB => {
  return {
    ...tx,
    plaidTx: plaidTx,
  };
};

export const createTxFromPlaidTx = (
  userId: string,
  plaidTx: Transaction,
): UnsavedTx => {
  return {
    id: undefined,
    plaidTx: plaidTx,
    name: plaidTx.name,
    amount: plaidTx.amount,
    date: plaidTx.date,
    userTotal: 0,
    originTxId: null,
    datetime: plaidTx.datetime || "",
    plaidId: plaidTx.transaction_id,
    userId: userId,
    accountId: plaidTx.account_id,
    catArray: [
      createNewCat({
        nameArray: plaidTx.category,
        amount: plaidTx.amount,
      }),
    ],
    splitArray: [createNewSplit(userId, plaidTx.amount, "")],
    receipt: null,
  };
};

export function createTx(
  userId: string,
  txInDB: TxInDB,
  plaidTx?: Transaction,
): UnsavedTx {
  return {
    plaidTx: plaidTx || null,
    id: txInDB.id,
    name: txInDB.name,
    amount: txInDB?.amount || plaidTx?.amount || 0,
    date: txInDB?.date || plaidTx?.date || "",
    userTotal: txInDB?.userTotal || 0,
    originTxId: txInDB?.originTxId || null,
    datetime: txInDB?.datetime || plaidTx?.datetime || "",
    plaidId: txInDB?.plaidId || plaidTx?.transaction_id || "",
    userId: userId,
    accountId: txInDB?.accountId || plaidTx?.account_id || "",
    catArray: txInDB?.catArray || [
      createNewCat({
        nameArray: plaidTx?.category || [],
        amount: plaidTx?.amount || 0,
      }),
    ],
    splitArray: txInDB?.splitArray || [
      createNewSplit(
        userId,
        txInDB?.amount || plaidTx?.amount || 0,
        txInDB?.id,
      ),
    ],
    receipt: txInDB?.receipt || null,
  };
}

export const organizeTxByCat = (txArray: TxInDB[]) => {
  const catArray: TreedCatWithTx[] = [];

  for (const tx of txArray) {
    const txCopy = structuredClone(tx);

    for (const cat of txCopy.catArray) {
      fillArrayByCat(catArray, txCopy, cat);
    }
  }

  return catArray;
};

export const organizeTxByTime = (txArray: TxInDB[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
  );
  const txOrganizedByTimeArray: TxInDB[][][][] = [[[[]]]];

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
  txArray: TxInDB[],
  date: Date,
  rangeFormat: "year" | "month" | "date",
) => {
  return txArray.filter((tx) => {
    const txDate = new Date(tx.date);
    txDate.setDate(txDate.getDate() + 1);
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
