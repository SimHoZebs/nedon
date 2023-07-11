import {
  HierarchicalCategory,
  CategoryWithTransactionArray,
  FullTransaction,
} from "./types";
import { Category as PlaidCategory } from "plaid";

export const organizeTransactionByCategory = (
  transactionArray: FullTransaction[],
) => {
  const categoryArray: CategoryWithTransactionArray[] = [];

  transactionArray.forEach((transaction) => {
    fillCategoryArray(categoryArray, { ...transaction });
  });

  return categoryArray;
};

export const convertPlaidCategoriesToCategoryArray = (
  categories: PlaidCategory[],
) => {
  const categoryArray: HierarchicalCategory[] = [];
  categories.forEach((category) => {
    test(categoryArray, { ...category });
  });
  return categoryArray;
};

const test = (
  categoryArray: HierarchicalCategory[],
  plaidCategory: PlaidCategory,
): HierarchicalCategory[] => {
  const category = plaidCategory.hierarchy;

  const firstCategory = category[0];

  let index = categoryArray.findIndex(
    (category) => category.name === firstCategory,
  );

  if (index === -1) {
    //if the category doesn't exist, then create it.
    categoryArray.push({
      name: firstCategory,
      subCategory: [],
    });

    index = categoryArray.length - 1;
  }

  const slicedCategoryArray = category.slice(1);

  if (slicedCategoryArray.length === 0) {
    return categoryArray;
  } else {
    plaidCategory.hierarchy = slicedCategoryArray;

    categoryArray[index].subCategory = test(
      categoryArray[index].subCategory,
      plaidCategory,
    );
  }

  return categoryArray;
};

const fillCategoryArray = (
  categoryArray: CategoryWithTransactionArray[],
  transaction: FullTransaction,
): CategoryWithTransactionArray[] => {
  const category = transaction.categoryArray[0].categoryTree;

  if (!category) return categoryArray;

  const firstCategory = category[0];

  let index = categoryArray.findIndex(
    (category) => category.name === firstCategory,
  );

  if (index === -1) {
    //if the category doesn't exist, then create it.
    categoryArray.push({
      name: firstCategory,
      transactionArray: [],
      subCategory: [],
    });

    index = categoryArray.length - 1;
  }

  const slicedCategoryArray = category.slice(1);

  if (slicedCategoryArray.length === 0) {
    categoryArray[index].transactionArray.push(transaction);
  } else {
    transaction.categoryArray[0].categoryTree = slicedCategoryArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    categoryArray[index].subCategory = fillCategoryArray(
      categoryArray[index].subCategory,
      transaction,
    );
  }

  return categoryArray;
};

export const organizeTransactionByTime = (
  transactionArray: FullTransaction[],
) => {
  const dateSortedTransactionArray = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime(),
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
      transaction,
    );

    lastDate = date;
  });

  return timeSortedTransactionArray;
};
