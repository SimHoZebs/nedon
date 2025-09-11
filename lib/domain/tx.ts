import type { TreedCatWithTx } from "@/types/cat";
import type { ChaseCSVTx, Tx, UnsavedTx } from "@/types/tx";

import useAutoLoadUser from "../hooks/useAutoLoadUser";
import { useStore } from "../store/store";
import { trpc } from "../util/trpc";
import { createNewCat, fillArrayByCat } from "./cat";

import { MdsType, Prisma } from "@prisma/client";
import type { Transaction } from "plaid";

export const resetTx = (tx: Tx) => ({
  ...tx,
  plaidTx: tx.plaidTx,
  catArray: [
    createNewCat({
      txId: tx.id,
      nameArray: tx.plaidTx?.category || [],
      amount: tx.amount,
    }),
  ],
  receipt: null,
});

export const mergePlaidTxWithTx = (tx: Tx, plaidTx: Transaction): Tx => {
  return {
    ...tx,
    plaidTx: plaidTx,
  };
};

export const createTxFromChaseCSV = (
  chaseCSVTx: ChaseCSVTx,
  userId: string,
): UnsavedTx => {
  return {
    plaidTx: null,
    splitTxArray: [],
    name: chaseCSVTx.Description,
    amount: Prisma.Decimal(chaseCSVTx.Amount),
    recurring: false,
    mds: MdsType.UNDETERMINED,
    datetime: new Date(chaseCSVTx.PostingDate),
    authorizedDatetime: new Date(chaseCSVTx.PostingDate),
    userTotal: Prisma.Decimal(0),
    originTxId: null,
    plaidId: null,
    ownerId: userId,
    accountId: null,
    catArray: [],
    receipt: null,
  };
};

export const createTxFromPlaidTx = (
  userId: string,
  plaidTx: Transaction,
): UnsavedTx => {
  return {
    plaidTx: plaidTx,
    name: plaidTx.name,
    splitTxArray: [],
    amount: Prisma.Decimal(plaidTx.amount),
    recurring: false,
    mds: MdsType.UNDETERMINED,
    userTotal: Prisma.Decimal(0),
    originTxId: null,
    datetime: plaidTx.datetime ? new Date(plaidTx.datetime) : null,
    authorizedDatetime: new Date(plaidTx.authorized_date || 0),
    plaidId: plaidTx.transaction_id,
    ownerId: userId,
    accountId: plaidTx.account_id,
    catArray: [],
    receipt: null,
  };
};

export const organizeTxByCat = (txArray: Tx[]) => {
  const catArray: TreedCatWithTx[] = [];

  for (const tx of txArray) {
    const txCopy = structuredClone(tx);

    for (const cat of txCopy.catArray) {
      fillArrayByCat(catArray, txCopy, cat);
    }
  }

  return catArray;
};

export const organizeTxByTime = (txArray: Tx[]) => {
  const txSortedByTimeArray = txArray.sort(
    (a, b) => b.authorizedDatetime.getTime() - a.authorizedDatetime.getTime(),
  );
  const txOrganizedByTimeArray: Tx[][][][] = [[[[]]]];

  let lastDate: Date | undefined;
  let yearIndex = -1;
  let monthIndex = -1;
  let dateIndex = -1;

  for (const tx of txSortedByTimeArray) {
    const date = new Date(tx.authorizedDatetime);
    date.setDate(date.getDate() + 1);
    if (!lastDate) {
      yearIndex++;
      monthIndex++;
      dateIndex++;
      lastDate = date;
    }

    //other indexs are resetted because if one if statement is true,
    //the following ifs are expected to be true as well and adjust the indexs accordingly.
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

    //fallback for when year differs but month somehow matches.
    if (monthIndex === -1) {
      monthIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
    //fallback for when month differs but date somehow matches.
    if (dateIndex === -1) {
      dateIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex] = [];
    }

    txOrganizedByTimeArray[yearIndex][monthIndex][dateIndex].push(tx);

    lastDate = date;
  }

  return txOrganizedByTimeArray;
};

export const getScopeIndex = (
  txOragnizedByTimeArray: Tx[][][][],
  date: Date,
  rangeFormat: "year" | "month" | "date",
): [number, number, number] => {
  let [y, m, d]: [number, number, number] = [-1, -1, -1];

  if (txOragnizedByTimeArray.length === 0) return [y, m, d];

  for (const [yIndex, year] of txOragnizedByTimeArray.entries()) {
    const txDate = new Date(year?.[0]?.[0]?.[0]?.authorizedDatetime);
    if (Number.isNaN(txDate.getDate())) return [y, m, d];

    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getFullYear() === date.getFullYear()) {
      y = yIndex;
      break;
    }
  }

  if (rangeFormat === "year") return [y, m, d];
  if (y === -1) return [y, m, d];

  for (const [mIndex, month] of txOragnizedByTimeArray[y].entries()) {
    const txDate = new Date(month[0][0].authorizedDatetime);
    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getMonth() === date.getMonth()) {
      m = mIndex;
      break;
    }
  }

  if (rangeFormat === "month") return [y, m, d];
  if (m === -1) return [y, m, d];

  for (const [dIndex, dateArray] of txOragnizedByTimeArray[y][m].entries()) {
    const txDate = new Date(dateArray[0].authorizedDatetime);
    txDate.setDate(txDate.getDate() + 1);
    if (txDate.getDate() === date.getDate()) {
      d = dIndex;
      break;
    }
  }

  return [y, m, d];
};

export const txTypeArray: ["spending", "received", "transfers"] = [
  "spending",
  "received",
  "transfers",
];

export type TxType = (typeof txTypeArray)[number];

export const useTxGetAll = () => {
  const { user: appUser, isLoading: appUserIsLoading } = useAutoLoadUser();
  const datetime = useStore((store) => store.datetime);

  console.debug(
    "useTxGetAll - appUser.hasAccessToken:",
    appUser?.hasAccessToken,
    "isLoading:",
    appUserIsLoading,
    "datetime:",
    datetime,
  );

  console.debug(
    "getAll?: ",
    (appUser?.hasAccessToken && !!datetime && !appUserIsLoading) === true,
  );

  const txGetAllResult = trpc.tx.getAll.useQuery(
    {
      id: appUser?.id || "",
      date: datetime || new Date(Date.now()).toString(),
    },
    {
      staleTime: 3600000,
      enabled:
        (appUser?.hasAccessToken && !!datetime && !appUserIsLoading) === true,
    },
  );

  return txGetAllResult;
};
