import {
  HierarchicalCategoryWithTransaction,
  FullTransaction,
  CategoryTreeClientSide,
} from "./types";

export const organizeTransactionByCategory = (
  transactionArray: FullTransaction[]
) => {
  const categoryTreeArray: HierarchicalCategoryWithTransaction[] = [];

  transactionArray.forEach((transaction) => {
    const transactionCopy = structuredClone(transaction);
    transaction.categoryTreeArray.forEach((categoryTree) => {
      fillArrayByCategory(categoryTreeArray, transactionCopy, categoryTree);
    });
  });

  return categoryTreeArray;
};

const fillArrayByCategory = (
  resultArray: HierarchicalCategoryWithTransaction[],
  transaction: FullTransaction,
  categoryTree: CategoryTreeClientSide
): HierarchicalCategoryWithTransaction[] => {
  const nameArray = categoryTree.nameArray;

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
    hierarchicalCategory.spending += categoryTree.amount;
  } else {
    hierarchicalCategory.received += categoryTree.amount;
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
    const newCategoryTree = structuredClone(categoryTree);
    newCategoryTree.nameArray = slicedNameArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    resultArray[index].subCategoryArray = fillArrayByCategory(
      resultArray[index].subCategoryArray,
      transactionCopy,
      newCategoryTree
    );
  }

  return resultArray;
};

export const organizeTransactionByTime = (
  transactionArray: FullTransaction[]
) => {
  const dateSortedTransactionArray = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
  );
  const timeSortedTransactionArray: FullTransaction[][][][] = [[[[]]]];

  let lastDate = new Date(0);
  let yearIndex = -1;
  let monthIndex = -1;
  let dayIndex = -1;

  dateSortedTransactionArray.forEach((transaction, i) => {
    const date = new Date(transaction.date);

    if (lastDate.getFullYear() !== date.getFullYear()) {
      yearIndex++;
      monthIndex = -1;
      dayIndex = -1;
      timeSortedTransactionArray[yearIndex] = [];
    }
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dayIndex = -1;
      timeSortedTransactionArray[yearIndex][monthIndex] = [];
    }
    if (lastDate.getDate() !== date.getDate()) {
      dayIndex++;
      timeSortedTransactionArray[yearIndex][monthIndex][dayIndex] = [];
    }

    timeSortedTransactionArray[yearIndex][monthIndex][dayIndex].push(
      transaction
    );

    lastDate = date;
  });

  return timeSortedTransactionArray;
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
