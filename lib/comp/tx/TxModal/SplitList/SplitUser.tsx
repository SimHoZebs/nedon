import Input from "@/comp/shared/Input";

import { toMoney } from "@/util/money";

import Decimal from "decimal.js";
import { useTxStore } from "lib/store/txStore";
import type React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;

  //splitAmount could be inferred from unsavedSplitTxArray[props.index] instead, but that would repeat calculation done in SplitList
  splitAmount: string;
  editedIndexArray: number[];
  onAmountChange: (splitAmount: string) => void;
}

const SplitUser = (props: Props) => {
  const tx = useTxStore((state) => state.txOnModal);
  const splitTxArray = tx?.splitTxArray || [];
  const setSplitTxArray = useTxStore((s) => s.setSplitTxArray);
  const splitTxAmountDisplayArray = useTxStore(
    (s) => s.splitTxAmountDisplayArray,
  );
  const focusedSplitTxIndex = useTxStore((state) => state.focusedSplitTxIndex);
  const amountDisplay = splitTxAmountDisplayArray[props.index];
  const amountPrefix = amountDisplay?.match(/^-?(?:\d+\.?\d*|\.\d+)/)?.[0];
  const amount = new Decimal(amountPrefix || 0);
  const catArray = tx?.catArray || [];
  const setCatArray = useTxStore((s) => s.setCatArray);
  const setEditedSplitTxIndexArray = useTxStore(
    (s) => s.setEditedSplitTxIndexArray,
  );
  const isEditingSplitTx = useTxStore((state) => state.isEditingSplitTx);

  const split = splitTxArray[props.index];
  const txAmount = tx?.amount || "0";
  const isModified =
    props.editedIndexArray.find(
      (modifiedIndex) => modifiedIndex === props.index,
    ) !== undefined;

  const removeUser = () => {
    const updatedCatArray = structuredClone(catArray);
    const updatedSplitTxArray = structuredClone(splitTxArray);

    //remove split from splitTxArray
    updatedSplitTxArray.splice(props.index, 1);
    setSplitTxArray(updatedSplitTxArray);

    //add split amount back to unassigned category
    const unassignedCat = updatedCatArray.findIndex(
      (cat) => cat.primary === "Unassigned",
    );

    if (unassignedCat === -1) {
      console.log("Unassigned category not found in catArray", updatedCatArray);
      return;
    }

    updatedCatArray[unassignedCat].amount = toMoney(
      new Decimal(updatedCatArray[unassignedCat].amount).plus(amount),
    );
    setCatArray(updatedCatArray);
  };

  return (
    <div className="flex w-full flex-col gap-y-1 rounded-lg lg:w-fit">
      <div className="flex w-full items-center justify-start gap-x-2">
        {focusedSplitTxIndex !== undefined ? (
          <div className="aspect-square w-5" />
        ) : (
          isEditingSplitTx && (
            <button
              type="button"
              title="Remove user from split"
              className="group flex w-5"
              onClick={() => removeUser()}
            >
              <span className="icon-[clarity--remove-line] h-5 w-5 text-zinc-500 group-hover:text-pink-400" />
            </button>
          )
        )}
        {props.children}

        <div className="flex w-full flex-col">
          <div className="flex w-full justify-between gap-x-2">
            <div className="flex items-center justify-between gap-x-2 font-light text-2xl">
              <label htmlFor="amount">$</label>
              <Input
                className={twMerge(
                  "w-full sm:w-20",
                  isModified ? "outline-2 outline-zinc-700" : "",
                )}
                id="amount"
                type="text"
                min={0}
                max={txAmount}
                onFocus={props.onFocus}
                value={props.splitAmount || "0"}
                step={0.01}
                onChange={(e) => {
                  //value can have arithmetic operators. Differentiate between
                  //number input and calculation input.
                  let numOnly: string;
                  try {
                    numOnly = new Decimal(e.target.value).toString();
                  } catch {
                    return;
                  }

                  if (numOnly === e.target.value) {
                    if (!isModified) {
                      const updatedArray = structuredClone(
                        props.editedIndexArray,
                      );
                      updatedArray.push(props.index);
                      setEditedSplitTxIndexArray(updatedArray);
                    }
                    const newValue = Decimal.min(e.target.value, txAmount);

                    props.onAmountChange(newValue.toString());
                  }
                }}
                //no onChange handler; it's handled externally, and the input is readOnly when isManaging.
              />
            </div>

            <div className="flex items-center font-light text-xl">
              <Input
                className="sm:w-16 lg:w-16"
                title="ratio"
                id="ratio"
                type="number"
                min={0}
                max={100}
                //0.01 does the same thing 0.01 $ steps
                step={1}
                value={
                  new Decimal(txAmount).isZero()
                    ? "0"
                    : amount.div(txAmount).mul(100).toString()
                }
                onFocus={props.onFocus}
                onChange={(e) => {
                  setEditedSplitTxIndexArray((prev) => [...prev, props.index]);
                  const prevPercentage = new Decimal(txAmount).isZero()
                    ? new Decimal(0)
                    : amount.div(txAmount).mul(100);
                  let parsedPercentage: Decimal;
                  try {
                    parsedPercentage = new Decimal(e.target.value);
                  } catch {
                    return;
                  }
                  if (!parsedPercentage.isFinite()) return;

                  const updatedPercentage = Decimal.min(parsedPercentage, 100);

                  let updatedSplitAmount = toMoney(
                    updatedPercentage.div(100).mul(txAmount),
                  );

                  if (amount.equals(updatedSplitAmount)) {
                    if (prevPercentage.lessThan(updatedPercentage)) {
                      updatedSplitAmount = toMoney(
                        new Decimal(updatedSplitAmount).plus(0.01),
                      );
                    } else {
                      updatedSplitAmount = toMoney(
                        new Decimal(updatedSplitAmount).minus(0.01),
                      );
                    }
                  }

                  props.onAmountChange(updatedSplitAmount);
                }}
              />
              <label htmlFor="ratio">%</label>
            </div>
          </div>

          <p className="font-light text-xs text-zinc-400">
            {split.ownerId?.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplitUser;
