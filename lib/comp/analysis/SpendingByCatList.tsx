import { getCatStyle, subCatTotal } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import type { TreedCatWithTx } from "@/util/types";

import { H3, H4 } from "../Heading";

interface Props {
  hierarchicalCatArray: TreedCatWithTx[];
}

const SpendingByCatList = (props: Props) => {
  return (
    <>
      {props.hierarchicalCatArray.map((cat, i) => (
        <div key={i} className="flex flex-col p-3">
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
                  {parseMoney(
                    ((cat.spending + subCatTotal(cat, "spending")) / 1000) *
                      100,
                  ).toString() + "%"}
                </p>
              </div>
            </div>

            <div>
              <H4>Spent</H4>
              <p>${cat.spending + subCatTotal(cat, "spending")}</p>
            </div>

            <div>
              <H4>Received</H4>
              <p>${-1 * (cat.received + subCatTotal(cat, "received"))}</p>
            </div>
          </div>

          {cat.subCatArray.length > 0 && (
            <details className="flex flex-col gap-y-2">
              <summary>Sub categories</summary>
              <SpendingByCatList hierarchicalCatArray={cat.subCatArray} />
            </details>
          )}
        </div>
      ))}
    </>
  );
};

export default SpendingByCatList;
