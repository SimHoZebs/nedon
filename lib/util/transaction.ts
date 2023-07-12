import {
  HierarchicalCategoryWithTransactionArray,
  FullTransaction,
  CategoryTreeClientSide,
} from "./types";

export const organizeTransactionByCategory = (
  transactionArray: FullTransaction[]
) => {
  const categoryTreeArray: HierarchicalCategoryWithTransactionArray[] = [];

  transactionArray.forEach((transaction) => {
    transaction.categoryTreeArray.forEach((categoryTree) => {
      const transactionCopy = structuredClone(transaction);
      transactionCopy.categoryTreeArray = [categoryTree];
      fillTransactionByCategory(
        categoryTreeArray,
        transactionCopy,
        categoryTree
      );
    });
  });

  return categoryTreeArray;
};

const fillTransactionByCategory = (
  resultArray: HierarchicalCategoryWithTransactionArray[],
  transaction: FullTransaction,
  categoryTree: CategoryTreeClientSide
): HierarchicalCategoryWithTransactionArray[] => {
  const nameArray = categoryTree.nameArray;

  if (!nameArray.length) return resultArray;

  const firstCategoryName = nameArray[0];

  let index = resultArray.findIndex((cat) => cat.name === firstCategoryName);

  if (index === -1) {
    //if the category doesn't exist, then create it.
    resultArray.push({
      name: firstCategoryName,
      amount: categoryTree.amount,
      transactionArray: [],
      subCategory: [],
    });

    index = resultArray.length - 1;
  }

  const slicedNameArray = nameArray.slice(1);

  if (slicedNameArray.length === 0) {
    resultArray[index].transactionArray.push(transaction);
    resultArray[index].amount += categoryTree.amount;
  } else {
    const transactionCopy = structuredClone(transaction);
    const newCategoryTree = structuredClone(categoryTree);
    newCategoryTree.nameArray = slicedNameArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    resultArray[index].subCategory = fillTransactionByCategory(
      resultArray[index].subCategory,
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
