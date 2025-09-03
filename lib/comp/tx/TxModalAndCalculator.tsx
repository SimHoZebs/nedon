import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import { useTxStore } from "@/util/txStore";

import type { SplitClientSide } from "@/types/split";

import Calculator from "./TxModal/SplitList/Calculator";
import TxModal from "./TxModal/TxModal";

import { motion } from "framer-motion";
import React, { useEffect } from "react";

interface Props {
  onClose: () => void;
}

const TxModalAndCalculator = (props: Props) => {
  const setSplitArray = useTxStore((s) => s.setSplitArray);
  const splitAmountDisplayArray = useTxStore((s) => s.splitAmountDisplayArray);
  const setSpiltAmountDisplayArray = useTxStore(
    (s) => s.setSplitAmountDisplayArray,
  );
  const isEditingSplit = useTxStore((s) => s.isEditingSplit);
  const editedSplitIndexArray = useTxStore((s) => s.editedSplitIndexArray);
  const hasEditedCatArray = useTxStore((s) => s.hasEditedCatArray);
  const focusedSplitIndex = useTxStore((state) => state.focusedSplitIndex);
  const tx = useTxStore((state) => state.txOnModal);
  const txAmount = tx?.amount || 0;
  const catArray = tx?.catArray || [];
  const splitArray = tx?.splitArray || [];
  const [isCalcHidden, setIsCalcHidden] = React.useState(false);
  const screenType = useStore((s) => s.screenType);

  //Changes a user's split amount and balances
  const changeSplitAmount = (index: number, newAmount: number) => {
    const updatedSplitArray = structuredClone(splitArray);

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
      editedSplitAmountTotal += catArray.reduce(
        (acc, cat) => acc + cat.amount,
        0,
      );
    }

    let remainder = txAmount - editedSplitAmountTotal;
    uneditedSplitArray.forEach((split, index) => {
      if (uneditedSplitArray.length === 1) {
        split.amount = parseMoney(remainder);
      } else if (index === uneditedSplitArray.length - 1) {
        split.amount = parseMoney(remainder);
      } else {
        split.amount = parseMoney(remainder / uneditedSplitArray.length);
        remainder = parseMoney(remainder - split.amount);
      }
    });

    setSplitArray(updatedSplitArray);
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
    <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <TxModal
        onClose={props.onClose}
        onSplitAmountChange={(index, amount) => {
          changeSplitAmount(index, Number.parseFloat(amount));
        }}
      />

      {isEditingSplit && focusedSplitIndex !== undefined && (
        <motion.div
          className="pointer-events-auto z-20 flex w-full flex-col lg:absolute lg:w-3/12 lg:justify-center"
          drag={screenType === "desktop"}
          dragMomentum={false}
        >
          <button
            className="z-20 w-full rounded-md rounded-b-none border border-zinc-700 border-b-0 bg-zinc-800 shadow-md"
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
