import { HierarchicalCategory } from "./types";
import { Category as PlaidCategory } from "plaid";

export const emptyCategory = (
  transactionId: string,
  categoryTree: string[],
) => {
  return {
    transactionId,
    id: null,
    categoryTree,
    amount: 0,
  };
};

export const convertPlaidCategoriesToHierarchicalArray = (
  categories: PlaidCategory[],
) => {
  const resultArray: HierarchicalCategory[] = [];

  categories.forEach((category) => {
    fillCategoryInHierarchy(resultArray, { ...category });
  });
  return resultArray;
};

export const fillCategoryInHierarchy = (
  resultArray: HierarchicalCategory[],
  plaidCategory: PlaidCategory,
): HierarchicalCategory[] => {
  const hierarchy = plaidCategory.hierarchy;

  const firstCategory = hierarchy[0];

  let index = resultArray.findIndex(
    (category) => category.name === firstCategory,
  );

  if (index === -1) {
    //if the category doesn't exist, then create it.
    resultArray.push({
      name: firstCategory,
      subCategory: [],
    });

    index = resultArray.length - 1;
  }

  const nextHierarchicalArray = hierarchy.slice(1);

  if (nextHierarchicalArray.length === 0) {
    return resultArray;
  } else {
    plaidCategory.hierarchy = nextHierarchicalArray;

    resultArray[index].subCategory = fillCategoryInHierarchy(
      resultArray[index].subCategory,
      plaidCategory,
    );
  }

  return resultArray;
};
