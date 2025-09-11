import type { SplitTx } from "@/types/tx";

import Calculator from "./TxModal/SplitList/Calculator";
import TxModal from "./TxModal/TxModal";

import { Prisma } from "@prisma/client";
import { motion } from "framer-motion";
import { useStore } from "lib/store/store";
import { useTxStore } from "lib/store/txStore";
import React, { useEffect } from "react";

// Define proper types for better type safety
interface Props {
  onClose: () => void;
}

const TxModalAndCalculator = (props: Props) => {
  const setSplitTxArray = useTxStore((s) => s.setSplitTxArray);
  const splitTxAmountDisplayArray = useTxStore(
    (s) => s.splitTxAmountDisplayArray,
  );
  const setSplitTxAmountDisplayArray = useTxStore(
    (s) => s.setSplitTxAmountDisplayArray,
  );
  const isEditingSplitTx = useTxStore((s) => s.isEditingSplitTx);
  const editedSplitTxIndexArray = useTxStore((s) => s.editedSplitTxIndexArray);
  const hasEditedCatArray = useTxStore((s) => s.hasEditedCatArray);
  const focusedSplitTxIndex = useTxStore((state) => state.focusedSplitTxIndex);
  const tx = useTxStore((state) => state.txOnModal);
  const txAmount: Prisma.Decimal = tx?.amount || new Prisma.Decimal(0);
  const catArray = tx?.catArray || [];
  const splitTxArray: SplitTx[] = tx?.splitTxArray || [];
  const [isCalcHidden, setIsCalcHidden] = React.useState(false);
  const screenType = useStore((s) => s.screenType);

  // Changes a user's split amount and balances
  const changeSplitAmount = (index: number, newAmount: number) => {
    const updatedSplitTxArray = structuredClone(splitTxArray);

    const newAmountFloored = Prisma.Decimal.max(
      Prisma.Decimal.min(new Prisma.Decimal(newAmount), txAmount),
      new Prisma.Decimal(0),
    );

    updatedSplitTxArray[index].amount = newAmountFloored;

    const uneditedSplitArray: SplitTx[] = [];
    const editedIndices = new Set(editedSplitTxIndexArray); // Optimize lookup

    // Calculate the total amount of the splits that hasn't been edited
    let editedSplitAmountTotal = new Prisma.Decimal(0);
    const len = updatedSplitTxArray.length;
    for (let i = 0; i < len; i++) {
      const split = updatedSplitTxArray[i];
      if (editedIndices.has(i) || i === index) {
        editedSplitAmountTotal = editedSplitAmountTotal.add(split.amount);
      } else {
        uneditedSplitArray.push(split);
      }
    }

    // Include tx.user's if needed
    if (hasEditedCatArray) {
      editedSplitAmountTotal = editedSplitAmountTotal.add(
        catArray.reduce(
          (acc, cat) => acc.add(cat.amount),
          new Prisma.Decimal(0),
        ),
      );
    }

    let remainder = txAmount.sub(editedSplitAmountTotal);

    // Handle edge case: no unedited splits
    if (uneditedSplitArray.length === 0) {
      // Optionally log or handle remainder
      console.warn(
        "No unedited splits to distribute remainder:",
        remainder.toNumber(),
      );
      return;
    }

    uneditedSplitArray.forEach((split, idx) => {
      if (uneditedSplitArray.length === 1) {
        split.amount = new Prisma.Decimal(remainder.toFixed(2));
      } else if (idx === uneditedSplitArray.length - 1) {
        split.amount = new Prisma.Decimal(remainder.toFixed(2));
      } else {
        const portion = remainder.div(uneditedSplitArray.length);
        split.amount = new Prisma.Decimal(portion.toFixed(2));
        remainder = remainder.sub(portion);
      }
    });

    setSplitTxArray(updatedSplitTxArray);
    const updatedSplitAmountDisplayArray = updatedSplitTxArray.map((split) =>
      split.amount.toString(),
    );

    setSplitTxAmountDisplayArray(updatedSplitAmountDisplayArray);
  };

  useEffect(() => {
    if (focusedSplitTxIndex !== undefined) {
      setIsCalcHidden(false);
    }
  }, [focusedSplitTxIndex]);

  return (
    <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <TxModal
        onClose={props.onClose}
        onSplitAmountChange={(index, amount) => {
          changeSplitAmount(index, Number.parseFloat(amount));
        }}
      />

      {isEditingSplitTx && focusedSplitTxIndex !== undefined && (
        <motion.div
          className="pointer-events-auto z-20 flex w-full flex-col lg:absolute lg:w-3/12 lg:justify-center"
          drag={screenType === "desktop"}
          dragMomentum={false}
        >
          <button
            className="z-20 w-full rounded-md rounded-b-none border border-zinc-700 border-b-0 bg-zinc-800 shadow-md"
            type="button"
            onClick={() => setIsCalcHidden(!isCalcHidden)}
            aria-label={isCalcHidden ? "Show calculator" : "Hide calculator"} // Added for accessibility
          >
            {isCalcHidden ? "Show" : "Hide"}
          </button>

          <motion.div
            className={"flex w-full lg:max-w-max"}
            initial={{ height: 0 }}
            animate={{ height: isCalcHidden ? 0 : "auto" }}
            exit={{ height: 0 }}
          >
            <Calculator
              value={splitTxAmountDisplayArray[focusedSplitTxIndex]}
              setValue={(value: string) => {
                const copy = [...splitTxAmountDisplayArray];
                copy[focusedSplitTxIndex] = value;

                // Removes anything after arithmetic
                const onlyNumber = Number.parseFloat(value).toString();
                // If the change was purely numeric, balance the split
                if (onlyNumber === value) {
                  changeSplitAmount(
                    focusedSplitTxIndex,
                    Number.parseFloat(value),
                  );
                } else {
                  setSplitTxAmountDisplayArray(copy);
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
