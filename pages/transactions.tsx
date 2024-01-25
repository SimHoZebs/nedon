import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import Calculator from "@/comp/tx/TxModal/SplitList/Calculator";
import TxModal from "@/comp/tx/TxModal/TxModal";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByTime } from "@/util/tx";
import { useTxStore } from "@/util/txStore";
import { FullTx, SplitClientSide } from "@/util/types";
import useDateRange from "@/util/useDateRange";

const Page: NextPage = () => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const tx = useTxStore((state) => state.txOnModal);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const isEditingSplit = useTxStore((state) => state.isEditingSplit);
  const editingSplitUserIndex = useTxStore(
    (state) => state.editingSplitUserIndex,
  );
  const splitAmountArray = useTxStore((state) => state.splitAmountDisplayArray);
  const setSplitAmountArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );
  const setIsEditing = useTxStore((state) => state.setIsEditingSplit);

  const [showModal, setShowModal] = useState(false);
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);
  const [modifiedSplitIndexArray, setModifiedSplitIndexArray] = useState<
    number[]
  >([]);
  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);

  const txAmount = tx?.amount || 0;

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "pending"
        ? console.debug("Can't set date. txArray is loading.")
        : console.error("Can't set date. Fetching txArray failed.");

      return;
    }

    if (rangeFormat === "all") {
      setScopedTxArray(txArray.data);
      return;
    }

    const filteredArray = filterTxByDate(txArray.data, date, rangeFormat);

    setScopedTxArray(filteredArray);
  }, [date, rangeFormat, txArray.data, txArray.status]);

  const sortedTxArray = useMemo(() => {
    return organizeTxByTime(scopedTxArray);
  }, [scopedTxArray]);

  const updateSplitCatAmount = (
    split: SplitClientSide,
    oldAmount: number,
    newAmount: number,
  ) => {
    const change = parseMoney(newAmount - oldAmount);
    let amountToDistribute = change;
    split.catArray.forEach((cat, index) => {
      const catAmount = cat.amount || 0;

      if (index === split.catArray.length - 1) {
        cat.amount = parseMoney(catAmount + amountToDistribute);
      } else {
        let share = oldAmount
          ? parseMoney((catAmount / oldAmount) * change)
          : parseMoney(change / split.catArray.length);

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

    let unmodifiedSplitArray: SplitClientSide[] = [];
    const modifiedSplitAmountTotal = updatedSplitArray
      .filter((split, i) => {
        if (
          modifiedSplitIndexArray.find(
            (modifiedIndex) => modifiedIndex === i,
          ) !== undefined ||
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
    const yeet = updatedSplitArray.map((split) =>
      calcSplitAmount(split).toString(),
    );
    console.log("yeet", yeet);
  };

  return (
    <section className="flex w-full justify-center">
      {showModal && (
        <div className="absolute left-0 top-0 flex h-full w-full flex-col">
          <TxModal
            setShowModal={setShowModal}
            onSplitAmountChange={(index, amount) => {
              changeSplitAmount(index, parseFloat(amount));
            }}
          />

          {isEditingSplit && editingSplitUserIndex !== undefined && (
            <Calculator
              value={splitAmountArray[editingSplitUserIndex]}
              setValue={(value: string) => {
                setIsEditing(true);
                if (splitAmountArray.length > 1) {
                  setModifiedSplitIndexArray([
                    ...modifiedSplitIndexArray,
                    editingSplitUserIndex,
                  ]);
                }

                const copy = [...splitAmountArray];
                copy[editingSplitUserIndex] = value;

                //removes anything after arithmetic
                const onlyNumber = parseFloat(value).toString();
                //if the change was purely numeric, balance the split
                if (onlyNumber === value) {
                  console.log("onlyNumber", onlyNumber);
                  changeSplitAmount(editingSplitUserIndex, parseFloat(value));
                } else {
                  setSplitAmountArray(copy);
                }
              }}
            />
          )}
        </div>
      )}

      <div className="flex w-full max-w-sm flex-col items-center gap-y-2 lg:max-w-md">
        <DateRangePicker
          date={date}
          setDate={setDate}
          rangeFormat={rangeFormat}
          setRangeFormat={setRangeFormat}
        />

        <DateSortedTxList
          setShowModal={setShowModal}
          sortedTxArray={sortedTxArray}
        />
      </div>
    </section>
  );
};

export default Page;
