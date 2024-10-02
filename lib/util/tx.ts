import type { Transaction } from "plaid";

import type { TreedCatWithTx } from "@/types/cat";
import type { TxClientSide, TxInDB } from "@/types/tx";

import { emptyCat, fillArrayByCat } from "./cat";
import { createNewSplit } from "./split";

export const resetFullTx = (tx: TxClientSide): TxClientSide => ({
  ...tx,
  plaidTx: tx.plaidTx,
  splitArray: [createNewSplit(tx.userId, tx.amount)],
  catArray: [
    emptyCat({
      nameArray: tx.plaidTx?.category || [],
      amount: tx.amount,
    }),
  ],
  id: undefined,
  receipt: null,
});

export function createTx(
  userId: string,
  plaidTx: undefined,
  txInDB: TxInDB,
): TxInDB;
export function createTx(
  userId: string,
  plaidTx: undefined,
  txInDB: TxClientSide,
): TxClientSide;
export function createTx(
  userId: string,
  plaidTx: Transaction,
  txInDB: TxInDB,
): TxInDB;
export function createTx(userId: string, plaidTx: Transaction): TxClientSide;
export function createTx(
  userId: string,
  plaidTx: Transaction,
  txInDB?: TxInDB,
): TxInDB | TxClientSide;
export function createTx(
  userId: string,
  plaidTx?: Transaction,
  txInDB?: TxInDB | TxClientSide,
): TxInDB | TxClientSide {
  return {
    plaidTx: plaidTx || null,
    id: txInDB?.id,
    name: txInDB?.name || plaidTx?.name || "",
    amount: txInDB?.amount || plaidTx?.amount || 0,
    date: txInDB?.date || plaidTx?.date || "",
    userTotal: txInDB?.userTotal || 0,
    originTxId: txInDB?.originTxId || null,
    datetime: txInDB?.datetime || plaidTx?.datetime || "",
    plaidId: txInDB?.plaidId || plaidTx?.transaction_id || "",
    userId: userId,
    accountId: txInDB?.accountId || plaidTx?.account_id || "",
    catArray: txInDB?.catArray || [
      emptyCat({
        nameArray: plaidTx?.category || [],
        amount: plaidTx?.amount || 0,
      }),
    ],
    splitArray: txInDB?.splitArray || [
      createNewSplit(userId, txInDB?.amount || plaidTx?.amount || 0),
    ],
    receipt: txInDB?.receipt || null,
  };
}

export const organizeTxByCat = (txArray: TxClientSide[]) => {
  const catArray: TreedCatWithTx[] = [];

  for (const tx of txArray) {
    const txCopy = structuredClone(tx);

    for (const cat of txCopy.catArray) {
      fillArrayByCat(catArray, txCopy, cat);
    }
  }

  return catArray;
};

export const organizeTxByTime = (txArray: TxClientSide[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
  );
  const txOrganizedByTimeArray: TxClientSide[][][][] = [[[[]]]];

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
  txArray: TxClientSide[],
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
