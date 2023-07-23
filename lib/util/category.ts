import {
  HierarchicalCategory,
  MergedCategory,
  SplitInDB,
  UnsavedSplit,
  UnsavedCategory,
} from "./types";
import { Category as PlaidCategory } from "plaid";
import categoryStyleArray from "./categoryStyle";

export const emptyCategory = ({
  nameArray,
  splitId,
  amount = 0,
}: {
  nameArray?: string[];
  splitId: string | null;
  amount: number;
}): UnsavedCategory => {
  return {
    id: null,
    nameArray: nameArray || [],
    splitId: splitId,
    amount: amount,
  };
};

export const getCategoryStyle = (nameArray: string[]) => {
  return categoryStyleArray[nameArray.slice(-1)[0]];
};

export const mergeCategoryArray = (
  splitArray: (SplitInDB | UnsavedSplit)[]
) => {
  const mergedCategoryArray: MergedCategory[] = [];

  splitArray.forEach((split) => {
    split.categoryArray.forEach(({ nameArray, amount, ...rest }) => {
      const storedCategory = mergedCategoryArray.find(
        ({ nameArray: storedNameArray }) =>
          storedNameArray[storedNameArray.length - 1] ===
          nameArray[nameArray.length - 1]
      );

      if (storedCategory) {
        storedCategory.amount += amount;
      } else {
        mergedCategoryArray.push(
          structuredClone({ nameArray, amount, ...rest })
        );
      }
    });
  });
  return mergedCategoryArray;
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
      plaidCategory
    );
  }

  return resultArray;
};
