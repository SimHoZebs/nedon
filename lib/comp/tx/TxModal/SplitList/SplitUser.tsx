import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

import Input from "@/comp/Input";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { useTxStore } from "@/util/txStore";

import UserSplitCat from "./UserSplitCat";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;

  //splitAmount could be inferred from unsavedSplitArray[props.index] instead, but that would repeat calculation done in SplitList
  splitAmount: string;
  editedIndexArray: number[];
  setEditedIndexArray: React.Dispatch<React.SetStateAction<number[]>>;
  onAmountChange: (splitAmount: string) => void;
}

const SplitUser = (props: Props) => {
  const { appUser } = getAppUser();
  const tx = useTxStore((state) => state.txOnModal);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const [showDetail, setShowDetail] = useState(false);
  const amountDisplayArray = useTxStore(
    (state) => state.splitAmountDisplayArray,
  );
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);
  const setFocusedIndex = useTxStore((state) => state.setFocusedSplitIndex);
  const amountDisplay = amountDisplayArray[props.index];
  const amount = parseFloat(amountDisplay);

  const split = unsavedSplitArray[props.index];
  const txAmount = tx ? tx.amount : 0;
  const isModified =
    props.editedIndexArray.find(
      (modifiedIndex) => modifiedIndex === props.index,
    ) !== undefined;

  const removeUser = () => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    const splicedSplit = updatedSplitArray.splice(props.index, 1);

    updatedSplitArray.forEach((split) => {
      split.catArray.forEach((cat, i) => {
        cat.amount += parseMoney(
          splicedSplit[0].catArray[i].amount / updatedSplitArray.length,
        );
      });
    });

    setUnsavedSplitArray(updatedSplitArray);
  };

  const onFocus = (e: React.FocusEvent<HTMLDivElement, Element>) => {
    setFocusedIndex(props.index);
  };

  return (
    <div className={`flex w-full flex-col gap-y-1 rounded-lg lg:w-fit `}>
      <div className="flex w-full items-center justify-start gap-x-2 ">
        {split.userId === appUser?.id || focusedIndex !== undefined ? (
          <div className="aspect-square w-5"></div>
        ) : (
          <button
            title="Remove user from split"
            className="group flex w-5"
            onClick={() => removeUser()}
          >
            <span className="icon-[clarity--remove-line] h-5 w-5 text-zinc-500 group-hover:text-pink-400" />
          </button>
        )}
        {props.children}

        <div className="flex w-full flex-col">
          <div className="flex w-full justify-between gap-x-2">
            <div className="flex items-center justify-between gap-x-2 text-2xl">
              <label htmlFor="amount">$</label>
              <Input
                className={twMerge(
                  "w-full ",
                  isModified ? "outline outline-2 outline-zinc-700" : "",
                )}
                id="amount"
                type="text"
                min={0}
                max={txAmount}
                onFocus={onFocus}
                value={props.splitAmount || 0}
                step={0.01}
                onChange={(e) => {
                  const numOnly = parseFloat(e.target.value).toString();
                  if (numOnly === e.target.value) {
                    if (!isModified) {
                      const updatedArray = structuredClone(
                        props.editedIndexArray,
                      );
                      updatedArray.push(props.index);
                      props.setEditedIndexArray(updatedArray);
                    }
                    const newValue = Math.min(
                      parseFloat(e.target.value),
                      txAmount,
                    );

                    props.onAmountChange(newValue.toString());
                  } else {
                  }
                }}
                //no onChange handler; it's handled externally, and the input is readOnly when isManaging.
              />
            </div>

            <div className="flex items-center text-xl">
              <Input
                className="sm:w-20 lg:w-20"
                title="ratio"
                id="ratio"
                type="number"
                min={0}
                max={100}
                //0.01 does the same thing 0.01 $ steps
                step={1}
                value={parseMoney((amount / txAmount) * 100)}
                onFocus={onFocus}
                onChange={(e) => {
                  props.setEditedIndexArray((prev) => [...prev, props.index]);
                  const prevPercentage = parseMoney((amount / txAmount) * 100);
                  let updatedPercentage = Math.min(
                    parseFloat(e.target.value),
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

          <p className="text-xs font-light text-zinc-400">
            {split.userId?.slice(0, 8)}
          </p>
        </div>
      </div>

      <button
        className={`group mb-5 flex w-full flex-col items-center justify-center overflow-hidden rounded-b-lg bg-zinc-700 ${
          showDetail || "h-1 hover:m-0 hover:h-fit"
        }`}
        onClick={() => setShowDetail(!showDetail)}
      >
        {showDetail && (
          <div className="flex w-full items-center justify-evenly border-x-2 border-t-2 border-zinc-700 bg-zinc-800">
            {split.catArray.map((cat, i) => (
              <UserSplitCat splitIndex={props.index} catIndex={i} key={i} />
            ))}
          </div>
        )}
        <div className="m-1 flex h-fit w-full justify-center bg-zinc-700">
          <span className="icon-[formkit--open] h-4 w-4" />
        </div>
      </button>
    </div>
  );
};

export default SplitUser;
