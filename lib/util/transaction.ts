import { mergeCategoryArray } from "./category";
import {
  TreedCategoryWithTransaction,
  FullTransaction,
  MergedCategory,
} from "./types";

export const organizeTransactionByCategory = (
  transactionArray: FullTransaction[]
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

const fillArrayByCategory = (
  resultArray: TreedCategoryWithTransaction[],
  transaction: FullTransaction,
  category: MergedCategory
): TreedCategoryWithTransaction[] => {
  const nameArray = category.nameArray;

  if (!nameArray.length) return resultArray;

  const firstCategoryName = nameArray[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCategoryName);

  const hierarchicalCategory = {
    name: firstCategoryName,
    received: 0,
    spending: 0,
    transactionArray: [],
    subCategoryArray: [],
  };

  if (transaction.amount > 0) {
    hierarchicalCategory.spending += category.amount;
  } else {
    hierarchicalCategory.received += category.amount;
  }

  if (index === -1) {
    //if the category doesn't exist, then create it.
    resultArray.push(hierarchicalCategory);

    index = resultArray.length - 1;
  }

  const slicedNameArray = nameArray.slice(1);

  if (slicedNameArray.length === 0) {
    resultArray[index].transactionArray.push(transaction);
    resultArray[index].spending += hierarchicalCategory.spending;
    resultArray[index].received += hierarchicalCategory.received;
  } else {
    const transactionCopy = structuredClone(transaction);
    const newCategory = structuredClone(category);
    newCategory.nameArray = slicedNameArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    resultArray[index].subCategoryArray = fillArrayByCategory(
      resultArray[index].subCategoryArray,
      transactionCopy,
      newCategory
    );
  }

  return resultArray;
};

export const organizeTransactionByTime = (
  transactionArray: FullTransaction[]
) => {
  const transactionSortedByTimeArray = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
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
      transaction
    );

    lastDate = date;
  });

  return transactionOrganizedByTimeArray;
};

export const filterTransactionByDate = (
  transactionArray: FullTransaction[],
  date: Date,
  rangeFormat: "year" | "month" | "date"
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
