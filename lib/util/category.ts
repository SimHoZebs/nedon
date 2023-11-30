import { Category as PlaidCategory } from "plaid";

import categoryStyleArray from "./categoryStyle";
import parseMoney from "./parseMoney";
import {
  CategoryClientSide,
  FullTransaction,
  MergedCategory,
  SplitClientSide,
  TreedCategory,
  TreedCategoryWithTransaction,
} from "./types";

export const emptyCategory = ({
  nameArray,
  splitId,
  amount = 0,
}: {
  nameArray?: string[];
  splitId: string | null;
  amount: number;
}): CategoryClientSide => {
  return {
    id: null,
    nameArray: nameArray || [],
    splitId: splitId,
    amount: amount,
  };
};

export const getCategoryStyle = (nameArray: string[]) => {
  const style = categoryStyleArray[nameArray.slice(-1)[0]];
  return style ? style : categoryStyleArray["Unknown"]!;
};

export const mergeCategoryArray = (splitArray: SplitClientSide[]) => {
  const mergedCategoryArray: MergedCategory[] = [];

  splitArray.forEach((split) => {
    split.categoryArray.forEach(({ nameArray, amount, ...rest }) => {
      const storedCategory = mergedCategoryArray.find(
        ({ nameArray: storedNameArray }) =>
          storedNameArray.at(-1) === nameArray.at(-1),
      );

      if (storedCategory) {
        storedCategory.amount += amount;
      } else {
        mergedCategoryArray.push(
          structuredClone({ nameArray, amount, ...rest }),
        );
      }
    });
  });
  return mergedCategoryArray;
};

export const convertPlaidCategoriesToHierarchicalArray = (
  plaidCategoryArray: PlaidCategory[],
) => {
  const resultArray: TreedCategory[] = [];

  plaidCategoryArray.forEach((category) => {
    fillCategoryInHierarchy(resultArray, { ...category });
  });
  return resultArray;
};

export const fillArrayByCategory = (
  resultArray: TreedCategoryWithTransaction[],
  transaction: FullTransaction,
  category: MergedCategory,
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
    resultArray[index].spending = parseMoney(resultArray[index].spending);
    resultArray[index].received += hierarchicalCategory.received;
    resultArray[index].received = parseMoney(resultArray[index].received);
  } else {
    const transactionCopy = structuredClone(transaction);
    const newCategory = structuredClone(category);
    newCategory.nameArray = slicedNameArray;

    //inefficient for cases where parent category did not exist; subcategory's existence doesn't need to be checked.
    resultArray[index].subCategoryArray = fillArrayByCategory(
      resultArray[index].subCategoryArray,
      transactionCopy,
      newCategory,
    );
  }

  return resultArray;
};

export const fillCategoryInHierarchy = (
  resultArray: TreedCategory[],
  plaidCategory: PlaidCategory,
): TreedCategory[] => {
  const hierarchy = plaidCategory.hierarchy;

  const firstCategory = hierarchy[0];

  let index = resultArray.findIndex(
    (category) => category.name === firstCategory,
  );

  if (index === -1) {
    //if the category doesn't exist, then create it.
    resultArray.push({
      name: firstCategory,
      subCategoryArray: [],
    });

    index = resultArray.length - 1;
  }

  const nextHierarchicalArray = hierarchy.slice(1);

  if (nextHierarchicalArray.length === 0) {
    return resultArray;
  } else {
    plaidCategory.hierarchy = nextHierarchicalArray;

    resultArray[index].subCategoryArray = fillCategoryInHierarchy(
      resultArray[index].subCategoryArray,
      plaidCategory,
    );
  }

  return resultArray;
};

export const subCategoryTotal = (
  parentCategory: TreedCategoryWithTransaction,
  transactionType: "received" | "spending",
): number => {
  const spending = parentCategory.subCategoryArray.reduce(
    (total, subCategory) => {
      let amount =
        transactionType === "received"
          ? subCategory.received
          : subCategory.spending;
      return total + amount + subCategoryTotal(subCategory, transactionType);
    },
    0,
  );

  return spending;
};

export const categoryArrayTotal = (
  categoryArray: TreedCategoryWithTransaction[],
  transactionType: "received" | "spending",
): number => {
  const spending = categoryArray.reduce((total, category) => {
    let amount =
      transactionType === "received" ? category.received : category.spending;
    return total + amount + subCategoryTotal(category, transactionType);
  }, 0);

  return parseMoney(spending);
};
