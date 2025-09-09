import type { TreedCat, TreedCatWithTx, UnsavedCat } from "@/types/cat";
import type { SavedTx } from "@/types/tx";

import catStyleArray from "./catStyle";
import parseMoney from "./parseMoney";
import type { TxType } from "./tx";

import { Prisma } from "@prisma/client";
import type { Category as PlaidCat } from "plaid";

export const createNewCat = ({
  txId,
  nameArray,
  amount = new Prisma.Decimal(0),
}: {
  txId: string;
  nameArray: string[] | null | undefined;
  amount: Prisma.Decimal;
}): UnsavedCat => {
  return {
    id: undefined,
    txId: txId,
    name: nameArray?.slice(-1)[0] || "Unknown",
    nameArray: nameArray || [],
    amount: amount,
  };
};

export const getCatStyle = (nameArray: string[]) => {
  const style = catStyleArray[nameArray.slice(-1)[0]];
  return style ? style : catStyleArray.Unknown;
};

export const convertPlaidCatsToHierarchicalArray = (
  plaidCatArray: PlaidCat[],
) => {
  const resultArray: TreedCat[] = [];

  for (const cat of plaidCatArray) {
    fillCatInHierarchy(resultArray, { ...cat });
  }
  return resultArray;
};

export const fillArrayByCat = (
  resultArray: TreedCatWithTx[],
  tx: SavedTx,
  cat: UnsavedCat,
): TreedCatWithTx[] => {
  const nameArray = cat.nameArray;

  if (!nameArray || !Array.isArray(nameArray) || !nameArray.length)
    return resultArray;

  const firstCatName = nameArray[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCatName);

  const hierarchicalCat = {
    name: firstCatName,
    received: 0,
    spending: 0,
    budget: cat.amount ? cat.amount.toNumber() : 0,
    txArray: [],
    subCatArray: [],
  };

  if (tx.amount.toNumber() > 0) {
    hierarchicalCat.spending += cat.amount.toNumber();
  } else {
    hierarchicalCat.received += cat.amount.toNumber();
  }

  if (index === -1) {
    //if the cat doesn't exist, then create it.
    resultArray.push(hierarchicalCat);

    index = resultArray.length - 1;
  }

  const slicedNameArray = nameArray.slice(1);

  if (slicedNameArray.length === 0) {
    resultArray[index].txArray.push(tx);
    resultArray[index].spending += hierarchicalCat.spending;
    resultArray[index].spending = parseMoney(resultArray[index].spending);
    resultArray[index].received += hierarchicalCat.received;
    resultArray[index].received = parseMoney(resultArray[index].received);
  } else {
    const txCopy = structuredClone(tx);
    const newCat = structuredClone(cat);
    newCat.nameArray = slicedNameArray;

    //inefficient for cases where parent cat did not exist; subcat's existence doesn't need to be checked.
    resultArray[index].subCatArray = fillArrayByCat(
      resultArray[index].subCatArray,
      txCopy,
      newCat,
    );
  }

  return resultArray;
};

export const fillCatInHierarchy = (
  resultArray: TreedCat[],
  plaidCat: PlaidCat,
): TreedCat[] => {
  const hierarchy = plaidCat.hierarchy;

  const firstCat = hierarchy[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCat);

  if (index === -1) {
    //if the cat doesn't exist, then create it.
    resultArray.push({
      name: firstCat,
      subCatArray: [],
    });

    index = resultArray.length - 1;
  }

  const nextHierarchicalArray = hierarchy.slice(1);

  if (nextHierarchicalArray.length === 0) {
    return resultArray;
  }
  plaidCat.hierarchy = nextHierarchicalArray;

  resultArray[index].subCatArray = fillCatInHierarchy(
    resultArray[index].subCatArray,
    plaidCat,
  );

  return resultArray;
};

export const subCatTotal = (
  parentCat: TreedCatWithTx,
  txType: TxType,
): number => {
  const spending = parentCat.subCatArray.reduce((total, subCat) => {
    const amount = txType === "received" ? subCat.received : subCat.spending;
    return total + amount + subCatTotal(subCat, txType);
  }, 0);

  return spending;
};

export const calcCatTypeTotal = (
  catArray: TreedCatWithTx[],
  txType: TxType,
): number => {
  const spending = catArray.reduce((total, cat) => {
    const amount = txType === "received" ? cat.received : cat.spending;
    return total + amount + subCatTotal(cat, txType);
  }, 0);

  return spending;
};
