import React from "react";

import { getCatStyle, subCatTotal } from "@/util/cat";
import type { TreedCatWithTx } from "@/util/types";

interface Props {
  organizedTxByCatArray: TreedCatWithTx[];
  spendingTotal: number;
}

const AnalysisBar = (props: Props) => {
  return (
    <div className="flex h-5 w-full gap-x-1 overflow-hidden rounded-lg bg-zinc-900">
      {props.organizedTxByCatArray.map((cat) => (
        <div
          key={cat.name}
          className={`+  h-full ${getCatStyle([cat.name]).bgColor}`}
          style={{
            width: `${(((cat.spending + subCatTotal(cat, "spending")) / props.spendingTotal) * 100).toString()}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnalysisBar;
