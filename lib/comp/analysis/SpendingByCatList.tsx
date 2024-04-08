import { getCatStyle, subCatTotal } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import type { TreedCatWithTx } from "@/util/types";

import type { TxType } from "@/util/tx";
import { H3 } from "../Heading";

interface Props {
  hierarchicalCatArray: TreedCatWithTx[];
  txType: TxType;
}

const SpendingByCatList = (props: Props) => {
  const sortCatAmount = (catArray: TreedCatWithTx[]) => {
    return catArray.sort((b, a) => {
      const aTotal =
        subCatTotal(a, props.txType) +
        (props.txType === "spending" ? a.spending : a.received);
      const bTotal =
        subCatTotal(b, props.txType) +
        (props.txType === "spending" ? b.spending : b.received);
      return aTotal - bTotal;
    });
  };

  return (
    <>
      {sortCatAmount(props.hierarchicalCatArray).map((cat) => (
        <div
          key={cat.name}
          className="flex flex-col p-3 bg-zinc-800 rounded-md hover:bg-zinc-700 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-x-2">
              <span
                className={`h-8 w-8 rounded-lg text-zinc-950 ${
                  getCatStyle([cat.name]).icon
                } ${getCatStyle([cat.name]).bgColor}`}
              />
              <div>
                <H3>{cat.name}</H3>

                <p className="text-sm text-zinc-400">
                  {`${parseMoney(
                    ((cat.spending + subCatTotal(cat, "spending")) / 1000) *
                      100,
                  ).toString()}%`}
                </p>
              </div>
            </div>

            <div>
              <H3>
                $
                {Math.abs(
                  subCatTotal(cat, props.txType) +
                    (props.txType === "spending" ? cat.spending : cat.received),
                )}
              </H3>
            </div>
          </div>

          {/*
            add as a toggle feature later
            cat.subCatArray.length > 0 && (
            <details className="flex flex-col gap-y-2">
              <summary>Sub categories</summary>
              <SpendingByCatList hierarchicalCatArray={cat.subCatArray} />
            </details>
          )*/}
        </div>
      ))}
    </>
  );
};

export default SpendingByCatList;
