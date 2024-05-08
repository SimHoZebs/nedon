import React, { useEffect } from "react";
import { motion } from "framer-motion";

import parseMoney from "@/util/parseMoney";
import { useTxStore } from "@/util/txStore";

import Calculator from "./TxModal/SplitList/Calculator";
import TxModal from "./TxModal/TxModal";
import { useStore } from "@/util/store";
import type { SplitClientSide } from "@/util/types";

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
  const hasEditedCatArray = useTxStore((s) => s.hasEditedCatArray);
  const unsavedCatArray = useTxStore((s) => s.unsavedCatArray);
  const focusedSplitIndex = useTxStore((state) => state.focusedSplitIndex);
  const tx = useTxStore((state) => state.txOnModal);
  const txAmount = tx?.amount || 0;
  const [isCalcHidden, setIsCalcHidden] = React.useState(false);
  const screenType = useStore((s) => s.screenType);

  //Changes a user's split amount and balances
  const changeSplitAmount = (index: number, newAmount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);

    const newAmountFloored = Math.max(Math.min(newAmount, txAmount), 0);

    updatedSplitArray[index].amount = newAmountFloored;

    const uneditedSplitArray: SplitClientSide[] = [];

    // Calculate the total amount of the splits that hasn't been edited
    let editedSplitAmountTotal = 0;
    const len = updatedSplitArray.length;
    for (let i = 0; i < len; i++) {
      const split = updatedSplitArray[i];
      //if was edited and isn't a split being changed
      if (
        editedSplitIndexArray.find((editedIndex) => editedIndex === i) !==
          undefined ||
        i === index
      ) {
        editedSplitAmountTotal += split.amount;
      } else {
        uneditedSplitArray.push(split);
      }
    }

    // include tx.user's if needed
    if (hasEditedCatArray) {
      editedSplitAmountTotal += unsavedCatArray.reduce(
        (acc, cat) => acc + cat.amount,
        0,
      );
    }

    let remainder = txAmount - editedSplitAmountTotal;
    uneditedSplitArray.forEach((split, index) => {
      if (index === uneditedSplitArray.length - 1) {
        split.amount += remainder;
      } else {
        split.amount += parseMoney(remainder / uneditedSplitArray.length);
        remainder = parseMoney(
          remainder - remainder / uneditedSplitArray.length,
        );
      }
    });

    setUnsavedSplitArray(updatedSplitArray);
    const updatedSplitAmountDisplayArray = updatedSplitArray.map((split) =>
      split.amount.toString(),
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
