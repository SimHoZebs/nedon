import React from "react";

import { getCategoryStyle } from "@/util/category";
import { TreedCategoryWithTransaction } from "@/util/types";

const subCategoryTotal = (
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

interface Props {
  organizedTxByCategoryArray: TreedCategoryWithTransaction[];
  spendingTotal: number;
}

const AnalysisBar = (props: Props) => {
  return (
    <div className="flex h-9 w-full gap-x-1 overflow-hidden rounded-lg bg-zinc-900">
      {props.organizedTxByCategoryArray.map((cat, i) => (
        <div
          key={i}
          className={"h-full " + getCategoryStyle([cat.name]).bgColor}
          style={{
            width:
              (
                ((cat.spending + subCategoryTotal(cat, "spending")) /
                  props.spendingTotal) *
                100
              ).toString() + "%",
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnalysisBar;
