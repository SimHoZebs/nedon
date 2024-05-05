import React, { useEffect } from "react";
import { motion } from "framer-motion";

import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { useTxStore } from "@/util/txStore";
import type { SplitClientSide } from "@/util/types";

import Calculator from "./TxModal/SplitList/Calculator";
import TxModal from "./TxModal/TxModal";
import { useStore } from "@/util/store";

interface Props {
  onClose: () => void;
}

const TxModalAndCalculator = (props: Props) => {
  const unsavedSplitArray = useTxStore((s) => s.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore((s) => s.setUnsavedSplitArray);
  const splitAmountDisplayArray = useTxStore((s) => s.splitAmountDisplayArray);
  const setSpiltAmountDisplayArray = useTxStore(
    (s) => s.setSplitAmountDisplayArray,
  );
  const isEditingSplit = useTxStore((s) => s.isEditingSplit);
  const editedSplitIndexArray = useTxStore((s) => s.editedSplitIndexArray);
  const focusedSplitIndex = useTxStore((state) => state.focusedSplitIndex);
  const tx = useTxStore((state) => state.txOnModal);
  const txAmount = tx?.amount || 0;
  const [isCalcHidden, setIsCalcHidden] = React.useState(false);
  const screenType = useStore((s) => s.screenType);

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

    const newAmountFloored = Math.max(Math.min(newAmount, txAmount), 0);

    updateSplitCatAmount(
      updatedSplitArray[index],
      calcSplitAmount(unsavedSplitArray[index]),
      newAmountFloored,
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
        }
        unmodifiedSplitArray.push(split);
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

  useEffect(() => {
    if (focusedSplitIndex !== undefined) {
      setIsCalcHidden(false);
    }
  }, [focusedSplitIndex]);

  return (
    <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <TxModal
        onClose={props.onClose}
        onSplitAmountChange={(index, amount) => {
          changeSplitAmount(index, Number.parseFloat(amount));
        }}
      />

      {isEditingSplit && focusedSplitIndex !== undefined && (
        <motion.div
          className="flex pointer-events-auto flex-col w-full lg:w-3/12 lg:absolute lg:justify-center z-20"
          drag={screenType === "desktop"}
          dragMomentum={false}
        >
          <button
            className="bg-zinc-800 z-20 w-full border-zinc-700 border shadow-md border-b-0 rounded-md rounded-b-none"
            type="button"
            onClick={() => setIsCalcHidden(!isCalcHidden)}
          >
            hide
          </button>

          <motion.div
            className={"flex w-full lg:max-w-max"}
            initial={{ height: 0 }}
            animate={{ height: isCalcHidden ? 0 : "" }}
            exit={{ height: 0 }}
          >
            <Calculator
              value={splitAmountDisplayArray[focusedSplitIndex]}
              setValue={(value: string) => {
                const copy = [...splitAmountDisplayArray];
                copy[focusedSplitIndex] = value;

                //removes anything after arithmetic
                const onlyNumber = Number.parseFloat(value).toString();
                //if the change was purely numeric, balance the split
                if (onlyNumber === value) {
                  changeSplitAmount(
                    focusedSplitIndex,
                    Number.parseFloat(value),
                  );
                } else {
                  setSpiltAmountDisplayArray(copy);
                }
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default TxModalAndCalculator;
