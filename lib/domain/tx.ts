import type { ChaseCSVTx, Tx, TxFormState } from "@/types/tx";

import useAutoLoadUser from "../hooks/useAutoLoadUser";
import { useStore } from "../store/store";
import { trpc } from "../util/trpc";

import { MdsType, Prisma, TxKind } from "@prisma/client";

export const createTxFromChaseCSV = (
  chaseCSVTx: ChaseCSVTx,
  userId: string,
): TxFormState => {
  return {
    kind: TxKind.USER,
    splitTxArray: [],
    name: chaseCSVTx.Description,
    amount: Number(chaseCSVTx.Amount),
    recurring: false,
    mds: MdsType.UNDETERMINED,
    datetime: new Date(chaseCSVTx.PostingDate),
    authorizedDatetime: new Date(chaseCSVTx.PostingDate),
    userTotal: 0,
    originTxId: null,
    originalBankTxId: null,
    bankId: null,
    ownerId: userId,
    accountId: null,
    logoUrl: null,
    isoCurrencyCode: null,
    locationAddress: null,
    locationCity: null,
    locationRegion: null,
    locationPostalCode: null,
    locationCountry: null,
    catArray: [],
    receipt: null,
  };
};

export const mapTxToFormState = (tx: Tx): TxFormState => {
  return {
    ...tx,
    amount: tx.amount.toNumber(),
    userTotal: tx.userTotal.toNumber(),
    splitTxArray: tx.splitTxArray.map((split) => ({
      ...split,
      amount: split.amount.toNumber(),
      userTotal: split.userTotal.toNumber(),
    })),
    catArray: tx.catArray.map((cat) => ({
      ...cat,
      amount: cat.amount.toNumber(),
    })),
    receipt: tx.receipt
      ? {
          ...tx.receipt,
          subtotal: tx.receipt.subtotal.toNumber(),
          tax: tx.receipt.tax.toNumber(),
          tip: tx.receipt.tip.toNumber(),
          grand_total: tx.receipt.grand_total.toNumber(),
          items: tx.receipt.items.map((item) => ({
            ...item,
            unit_price: item.unit_price.toNumber(),
          })),
        }
      : null,
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

    if (monthIndex === -1) {
      monthIndex++;
      txOrganizedByTimeArray[yearIndex][monthIndex] = [];
    }
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
  rangeFormat: "year" | "month" | "date" | "all",
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
  const datetime = useStore((store) => store.appInitDatetime);

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
      userId: appUser?.id || "",
      date: datetime || new Date(Date.now()),
    },
    {
      staleTime: 3600000,
      enabled:
        (appUser?.hasAccessToken && !!datetime && !appUserIsLoading) === true,
    },
  );

  return txGetAllResult;
};
