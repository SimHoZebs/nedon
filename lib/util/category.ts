import { CategoryTreeClientSide, HierarchicalCategory } from "./types";
import { Category as PlaidCategory } from "plaid";

export const emptyCategory = (
  transactionId: string,
  name: string[]
): CategoryTreeClientSide => {
  return {
    transactionId,
    id: null,
    nameArray: name,
    amount: 0,
  };
};

export const convertPlaidCategoriesToHierarchicalArray = (
  plaidCategoryArray: PlaidCategory[]
) => {
  const resultArray: HierarchicalCategory[] = [];

  plaidCategoryArray.forEach((category) => {
    fillCategoryInHierarchy(resultArray, { ...category });
  });
  return resultArray;
};

export const fillCategoryInHierarchy = (
  resultArray: HierarchicalCategory[],
  plaidCategory: PlaidCategory
): HierarchicalCategory[] => {
  const hierarchy = plaidCategory.hierarchy;

  const firstCategory = hierarchy[0];

  let index = resultArray.findIndex(
    (category) => category.name === firstCategory
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
      plaidCategory
    );
  }

  return resultArray;
};
