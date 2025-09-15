import type {
  ChaseCSVTx,
  Tx,
  TxWithUnsavedContent,
  UnsavedTx,
} from "@/types/tx";

import useAutoLoadUser from "../hooks/useAutoLoadUser";
import { useStore } from "../store/store";
import { trpc } from "../util/trpc";
import { convertPlaidCatToCat, resetCatArray } from "./cat";

import { createId } from "@paralleldrive/cuid2";
import { MdsType, Prisma } from "@prisma/client";
import type { Transaction } from "plaid";

export const resetTxToPlaidTx = (tx: Tx): TxWithUnsavedContent => {
  return {
    ...tx,
    catArray: resetCatArray(tx),
    receipt: null,
  };
};

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
  const id = createId();

  return {
    id: id,
    plaidTx: plaidTx,
    name: plaidTx.name,
    splitTxArray: [],
    amount: Prisma.Decimal(plaidTx.amount),
    recurring: false,
    mds: MdsType.UNDETERMINED,
    userTotal: Prisma.Decimal(0),
    originTxId: id,
    datetime: plaidTx.datetime ? new Date(plaidTx.datetime) : null,
    authorizedDatetime: new Date(plaidTx.authorized_date || 0),
    plaidId: plaidTx.transaction_id,
    ownerId: userId,
    accountId: plaidTx.account_id,
    catArray: plaidTx.personal_finance_category
      ? [
          convertPlaidCatToCat(
            plaidTx.personal_finance_category,
            id,
            Prisma.Decimal(plaidTx.amount),
          ),
        ]
      : [],
    receipt: null,
  };
};

export type NestedCatWithTx = {
  primary: {
    name: string;
    total: Prisma.Decimal;
    detailed: {
      name: string;
      txs: Tx[];
      total: Prisma.Decimal;
    }[];
  };
};

export const convertTxArrayToNestedCatWithTxArray = (txArray: Tx[]) => {
  const catWithTxArray: NestedCatWithTx[] = [];

  for (const tx of txArray) {
    for (const cat of tx.catArray) {
      const catIndex = catWithTxArray.findIndex(
        (c) => c.primary.name === cat.primary,
      );

      if (catIndex === -1) {
        catWithTxArray.push({
          primary: {
            name: cat.primary,
            total: Prisma.Decimal(0),
            detailed: [
              {
                name: cat.detailed,
                txs: [tx],
                total: tx.amount,
              },
            ],
          },
        });
        continue;
      }

      const primaryCat = catWithTxArray[catIndex].primary;
      const detailedCatIndex = primaryCat.detailed.findIndex(
        (d) => d.name === cat.detailed,
      );

      if (detailedCatIndex === -1) {
        primaryCat.detailed.push({
          name: cat.detailed,
          txs: [tx],
          total: tx.amount,
        });
        primaryCat.total = primaryCat.total.add(tx.amount);
        continue;
      }

      const detailedCat = primaryCat.detailed[detailedCatIndex];
      detailedCat.txs.push(tx);
      detailedCat.total = detailedCat.total.add(tx.amount);
      primaryCat.total = primaryCat.total.add(tx.amount);
    }
  }

  return catWithTxArray;
};

export const txTypeArray: ["spending", "received", "transfers"] = [
  "spending",
  "received",
  "transfers",
] as const;

export type TxType = (typeof txTypeArray)[number];

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
