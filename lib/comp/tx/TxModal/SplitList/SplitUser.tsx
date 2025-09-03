import Input from "@/comp/Input";

import parseMoney from "@/util/parseMoney";
import { useTxStore } from "@/util/txStore";

import type React from "react";
import { twMerge } from "tailwind-merge";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;

  //splitAmount could be inferred from unsavedSplitArray[props.index] instead, but that would repeat calculation done in SplitList
  splitAmount: string;
  editedIndexArray: number[];
  onAmountChange: (splitAmount: string) => void;
}

const SplitUser = (props: Props) => {
  const tx = useTxStore((state) => state.txOnModal);
  const splitArray = tx?.splitArray || [];
  const setSplitArray = useTxStore((s) => s.setSplitArray);
  const amountDisplayArray = useTxStore((s) => s.splitAmountDisplayArray);
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);
  const amountDisplay = amountDisplayArray[props.index];
  const amount = Number.parseFloat(amountDisplay);
  const catArray = tx?.catArray || [];
  const setCatArray = useTxStore((s) => s.setCatArray);
  const setEditedIndexArray = useTxStore((s) => s.setEditedSplitIndexArray);
  const isEditingSplit = useTxStore((state) => state.isEditingSplit);

  const split = splitArray[props.index];
  const txAmount = tx ? tx.amount : 0;
  const isModified =
    props.editedIndexArray.find(
      (modifiedIndex) => modifiedIndex === props.index,
    ) !== undefined;

  const removeUser = () => {
    const updatedCatArray = structuredClone(catArray);
    const updatedSplitArray = structuredClone(splitArray);

    //remove split from splitArray
    updatedSplitArray.splice(props.index, 1);
    setSplitArray(updatedSplitArray);

    //add split amount back to unassigned category
    const unassignedCat = updatedCatArray.findIndex(
      (cat) => cat.name === "Unassigned",
    );

    if (unassignedCat === -1) {
      console.log("Unassigned category not found in catArray", updatedCatArray);
      return;
    }

    updatedCatArray[unassignedCat].amount += amount;
    setCatArray(updatedCatArray);
  };

  return (
    <div className="flex w-full flex-col gap-y-1 rounded-lg lg:w-fit">
      <div className="flex w-full items-center justify-start gap-x-2">
        {focusedIndex !== undefined ? (
          <div className="aspect-square w-5" />
        ) : (
          isEditingSplit && (
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
                  isModified ? "outline outline-2 outline-zinc-700" : "",
                )}
                id="amount"
                type="text"
                min={0}
                max={txAmount}
                onFocus={props.onFocus}
                value={props.splitAmount || 0}
                step={0.01}
                onChange={(e) => {
                  //value can have arithmetic operators. Differentiate between
                  //number input and calculation input.
                  const numOnly = Number.parseFloat(e.target.value).toString();

                  if (numOnly === e.target.value) {
                    if (!isModified) {
                      const updatedArray = structuredClone(
                        props.editedIndexArray,
                      );
                      updatedArray.push(props.index);
                      setEditedIndexArray(updatedArray);
                    }
                    const newValue = Math.min(
                      Number.parseFloat(e.target.value),
                      txAmount,
                    );

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
                value={parseMoney((amount / txAmount) * 100)}
                onFocus={props.onFocus}
                onChange={(e) => {
                  setEditedIndexArray((prev) => [...prev, props.index]);
                  const prevPercentage = parseMoney((amount / txAmount) * 100);
                  const updatedPercentage = Math.min(
                    Number.parseFloat(e.target.value),
                    100,
                  );

                  let updatedSplitAmount = parseMoney(
                    (updatedPercentage / 100) * txAmount,
                  );

                  if (amount === updatedSplitAmount) {
                    if (prevPercentage < updatedPercentage) {
                      updatedSplitAmount = parseMoney(
                        updatedSplitAmount + 0.01,
                      );
                    } else {
                      updatedSplitAmount = parseMoney(
                        updatedSplitAmount - 0.01,
                      );
                    }
                  }

                  props.onAmountChange(updatedSplitAmount.toString());
                }}
              />
              <label htmlFor="ratio">%</label>
            </div>
          </div>

          <p className="font-light text-xs text-zinc-400">
            {split.userId?.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplitUser;
