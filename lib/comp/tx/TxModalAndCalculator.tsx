import React from "react";

import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { useTxStore } from "@/util/txStore";
import type { SplitClientSide } from "@/util/types";

import Calculator from "./TxModal/SplitList/Calculator";
import TxModal from "./TxModal/TxModal";

interface Props {
  onClose: () => void;
}

const TxModalAndCalculator = (props: Props) => {
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const splitAmountDisplayArray = useTxStore(
    (state) => state.splitAmountDisplayArray,
  );
  const setSpiltAmountDisplayArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );
  const editedSplitIndexArray = useTxStore(
    (state) => state.editedSplitIndexArray,
  );
  const focusedSplitIndex = useTxStore((state) => state.focusedSplitIndex);
  const tx = useTxStore((state) => state.txOnModal);
  const txAmount = tx?.amount || 0;

  const updateSplitCatAmount = (
    split: SplitClientSide,
    oldAmount: number,
    newAmount: number,
  ) => {
    const diff = parseMoney(newAmount - oldAmount);
    let amountToDistribute = diff;
    split.catArray.forEach((cat, i) => {
      const catAmount = cat.amount || 0;

      if (i === split.catArray.length - 1) {
        cat.amount = parseMoney(catAmount + amountToDistribute);
      } else {
        const share = oldAmount
          ? parseMoney((catAmount / oldAmount) * diff)
          : parseMoney(diff / split.catArray.length);

        cat.amount = parseMoney(catAmount + share);

        amountToDistribute = parseMoney(amountToDistribute - share);
      }
    });
  };

  //Changes a user's split amount and balances
  const changeSplitAmount = (index: number, newAmount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);

    newAmount = Math.max(Math.min(newAmount, txAmount), 0);

    updateSplitCatAmount(
      updatedSplitArray[index],
      calcSplitAmount(unsavedSplitArray[index]),
      newAmount,
    );

    const unmodifiedSplitArray: SplitClientSide[] = [];
    const modifiedSplitAmountTotal = updatedSplitArray
      .filter((split, i) => {
        if (
          editedSplitIndexArray.find((modifiedIndex) => modifiedIndex === i) !==
            undefined ||
          i === index
        ) {
          return split;
        } else {
          unmodifiedSplitArray.push(split);
        }
      })
      .reduce((total, split) => calcSplitAmount(split) + total, 0);

    let remainder = txAmount - modifiedSplitAmountTotal;
    unmodifiedSplitArray.forEach((split, index) => {
      if (index === unmodifiedSplitArray.length - 1) {
        updateSplitCatAmount(split, calcSplitAmount(split), remainder);
      } else {
        updateSplitCatAmount(
          split,
          calcSplitAmount(split),
          parseMoney(remainder / unmodifiedSplitArray.length),
        );
        remainder = parseMoney(
          remainder - remainder / unmodifiedSplitArray.length,
        );
      }
    });

    setUnsavedSplitArray(updatedSplitArray);
    const updatedSplitAmountDisplayArray = updatedSplitArray.map((split) =>
      calcSplitAmount(split).toString(),
    );

    setSpiltAmountDisplayArray(updatedSplitAmountDisplayArray);
  };

  return (
    <div className="absolute left-0 top-0 flex h-full w-full flex-col">
      <TxModal
        onClose={props.onClose}
        onSplitAmountChange={(index, amount) => {
          changeSplitAmount(index, Number.parseFloat(amount));
        }}
      />

      {focusedSplitIndex !== undefined && (
        <Calculator
          value={splitAmountDisplayArray[focusedSplitIndex]}
          setValue={(value: string) => {
            const copy = [...splitAmountDisplayArray];
            copy[focusedSplitIndex] = value;

            //removes anything after arithmetic
            const onlyNumber = Number.parseFloat(value).toString();
            //if the change was purely numeric, balance the split
            if (onlyNumber === value) {
              changeSplitAmount(focusedSplitIndex, Number.parseFloat(value));
            } else {
              setSpiltAmountDisplayArray(copy);
            }
          }}
        />
      )}
    </div>
  );
};

export default TxModalAndCalculator;
