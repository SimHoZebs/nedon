import type { Category as PlaidCat } from "plaid";

import catShortName from "./catShortName";
import catStyleArray from "./catStyle";
import parseMoney from "./parseMoney";
import type { TxType } from "./tx";
import type {
  CatClientSide,
  FullTxClientSide,
  TreedCat,
  TreedCatWithTx,
} from "./types";

export const emptyCat = ({
  txId,
  nameArray,
  amount = 0,
}: {
  txId?: string;
  nameArray?: string[];
  amount: number;
}): CatClientSide => {
  console.log(
    "Shortened :",
    catShortName[nameArray?.at(-1) || "Unknown"]?.shortName || "Unknown",
  );

  // console.log(
  //   "Checking the other arrays : ",
  //   nameArray?.slice(-1)[0] || "Unknown",
  // );
  return {
    id: undefined,
    txId: txId,
    name: nameArray ? getShortCatName(nameArray) : "Unknown",
    nameArray: nameArray || [],
    amount: amount,
  };
};

export const getShortCatName = (nameArray: string[]) => {
  const shortName = catShortName[nameArray.slice(-1)[0]]?.shortName;
  return shortName ? shortName : nameArray.slice(-1)[0];
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
  tx: FullTxClientSide,
  cat: CatClientSide,
): TreedCatWithTx[] => {
  const nameArray = cat.nameArray;

  if (!nameArray || !nameArray.length) return resultArray;

  const firstCatName = nameArray[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCatName);

  const hierarchicalCat = {
    name: firstCatName,
    received: 0,
    spending: 0,
    budget: cat.amount || 0,
    txArray: [],
    subCatArray: [],
  };

  if (tx.amount > 0) {
    hierarchicalCat.spending += cat.amount;
  } else {
    hierarchicalCat.received += cat.amount;
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

  return parseMoney(spending);
};
