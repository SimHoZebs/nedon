import React from "react";

import { getCategoryStyle, subCategoryTotal } from "@/util/category";
import { TreedCategoryWithTransaction } from "@/util/types";

interface Props {
  organizedTxByCategoryArray: TreedCategoryWithTransaction[];
  spendingTotal: number;
}

const AnalysisBar = (props: Props) => {
  return (
    <div className="flex h-5 w-full gap-x-1 overflow-hidden rounded-lg bg-zinc-900">
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
