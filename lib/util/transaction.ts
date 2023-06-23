import { Transaction as PlaidTransaction } from "plaid";

export type Category = {
  name: string;
  transactionArray: PlaidTransaction[];
  subCategory: Category[];
};

export const organizeTransactionByCategory = (
  transactionArray: PlaidTransaction[]
) => {
  const categoryArray: Category[] = [];

  transactionArray.forEach((transaction) => {
    fillCategoryArray(categoryArray, { ...transaction });
  });

  return categoryArray;
};

const fillCategoryArray = (
  categoryArray: Category[],
  transaction: PlaidTransaction
): Category[] => {
  const category = transaction.category;

  //error case
  if (!category) return categoryArray;

  const firstCategory = category[0];

  let index = categoryArray.findIndex(
    (category) => category.name === firstCategory
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
    transaction.category = slicedCategoryArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    categoryArray[index].subCategory = fillCategoryArray(
      categoryArray[index].subCategory,
      transaction
    );
  }

  return categoryArray;
};

export const organizeTransactionByTime = (
  transactionArray: PlaidTransaction[]
) => {
  const timeSortedTransaction = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
  );
  //create an object called sortedTransaction.
  const test: PlaidTransaction[][][][] = [[[[]]]];
  let lastDate = new Date(0);
  let yearIndex = -1;
  let monthIndex = -1;
  let dayIndex = -1;

  timeSortedTransaction.forEach((transaction, i) => {
    const date = new Date(transaction.date);

    if (lastDate.getFullYear() !== date.getFullYear()) {
      yearIndex++;
      monthIndex = -1;
      dayIndex = -1;
      test[yearIndex] = [];
    }
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dayIndex = -1;
      test[yearIndex][monthIndex] = [];
    }
    if (lastDate.getDate() !== date.getDate()) {
      dayIndex++;
      test[yearIndex][monthIndex][dayIndex] = [];
    }

    test[yearIndex][monthIndex][dayIndex].push(transaction);

    lastDate = date;
  });

  return test;
};
