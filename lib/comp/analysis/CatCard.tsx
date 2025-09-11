import type { TreedCatWithTx } from "@/types/cat";

import { H3 } from "../shared/Heading";

import { type CatSettings, Prisma } from "@prisma/client";
import { getCatStyle, subCatTotal } from "lib/domain/cat";
import type { TxType } from "lib/domain/tx";

interface Props {
  txType: TxType;
  catSettings?: CatSettings;
  showModal: () => void;
  cat: TreedCatWithTx;
}

const CatCard = (props: Props) => {
  const subCatTotalAmount = Number(
    Math.abs(
      subCatTotal(props.cat, props.txType) +
        (props.txType === "spending" ? props.cat.spending : props.cat.received),
    ).toFixed(2),
  );
  console.log("subCatTotalAmount", subCatTotalAmount);

  return (
    <button
      type="button"
      key={props.cat.name}
      className="flex cursor-pointer flex-col p-3 outline-1 outline-white hover:bg-zinc-700"
      onKeyDown={() => props.showModal()}
      onClick={() => props.showModal()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-x-2">
          <span
            className={`h-8 w-8 rounded-lg text-zinc-950 ${
              getCatStyle([props.cat.name]).icon
            } ${getCatStyle([props.cat.name]).bgColor}`}
          />
          <div>
            <H3>{props.cat.name}</H3>

            <p className="text-sm text-zinc-400">
              {`${(
                ((props.cat.spending + subCatTotal(props.cat, "spending")) /
                  1000) *
                  100
              ).toFixed(2)}%`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex">
            <H3>${subCatTotalAmount}</H3>
            <p className="text-sm text-zinc-400">
              {props.catSettings && ` /${props.catSettings?.budget}`}
            </p>
          </div>
          {props.catSettings && (
            <p className="text-sm text-zinc-400">
              {Prisma.Decimal.div(subCatTotalAmount, props.catSettings.budget)
                .mul(100)
                .toNumber()}
              % of ${props.catSettings.budget.toNumber()}
            </p>
          )}
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
    </button>
  );
};

export default CatCard;
