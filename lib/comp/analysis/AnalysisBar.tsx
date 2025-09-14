import type { Prisma } from "@prisma/client";
import { getCatStyle } from "lib/domain/cat";
import type { NestedCatWithTx } from "lib/domain/tx";
import { useId } from "react";

interface Props {
  organizedTxByCatArray: NestedCatWithTx[];
  spendingTotal: Prisma.Decimal;
}

const AnalysisBar = (props: Props) => {
  const id = useId();

  return (
    <div className="flex h-5 w-full gap-x-[3px] overflow-hidden bg-zinc-900">
      {props.organizedTxByCatArray.map((cat) => (
        <div
          key={id}
          className={`+ h-full ${getCatStyle(cat.primary.name).bgColor}`}
          style={{
            width: `${cat.primary.total.dividedBy(props.spendingTotal).mul(100).toFixed(2)}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnalysisBar;
