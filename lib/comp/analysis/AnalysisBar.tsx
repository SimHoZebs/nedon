import Decimal from "decimal.js";
import { getCatStyle } from "lib/domain/cat";
import type { NestedCatWithTx } from "lib/domain/tx";
import { useId } from "react";

interface Props {
  organizedTxByCatArray: NestedCatWithTx[];
  spendingTotal: Decimal;
}

const AnalysisBar = (props: Props) => {
  const id = useId();

  return (
    <div className="flex h-5 w-full gap-x-[3px] overflow-hidden bg-zinc-900">
      {props.organizedTxByCatArray.map((cat) => (
        <div
          key={`${id}-${cat.primary.name}`}
          className={`+ h-full ${getCatStyle(cat.primary.name, cat.primary.detailed[0].name).bgColor}`}
          style={{
            width: props.spendingTotal.isZero()
              ? "0%"
              : `${new Decimal(cat.primary.total.toString()).dividedBy(props.spendingTotal).mul(100).toFixed(2)}%`,
          }}
        />
      ))}
    </div>
  );
};

export default AnalysisBar;
