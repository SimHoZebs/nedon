import { Transaction as PlaidTransaction } from "plaid";

export const organizeTransactionByCategory = (
  transactionArray: PlaidTransaction[]
) => {
  const result: {
    name: string;
    transactionArray: PlaidTransaction[];
  }[] = [];

  transactionArray.forEach((transaction) => {
    const categoryIndex = result.findIndex((category) =>
      transaction.category?.find((name) => name === category.name)
    );

    if (categoryIndex !== -1) {
      result[categoryIndex].transactionArray.push(transaction);
    } else {
      result.push({
        name: transaction.category?.[0] || "ErrorCategory",
        transactionArray: [transaction],
      });
    }
  });

  return result;
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
