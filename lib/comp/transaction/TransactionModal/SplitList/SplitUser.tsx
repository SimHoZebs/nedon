import React, { useState } from "react";

import Input from "@/comp/Input";

import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";
import { SplitClientSide } from "@/util/types";

import UserSplitCategory from "./UserSplitCategory";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
  modifiedSplitIndexArray: number[];
  setModifiedSplitIndexArray: React.Dispatch<React.SetStateAction<number[]>>;
}

const SplitUser = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray,
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );
  const [showDetail, setShowDetail] = useState(false);

  const split = unsavedSplitArray[props.index];
  const splitAmount = calcSplitAmount(split);
  const transactionAmount = transaction ? transaction.amount : 0;
  const isModified =
    props.modifiedSplitIndexArray.find(
      (modifiedIndex) => modifiedIndex === props.index,
    ) !== undefined;

  const removeUser = () => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    const splicedSplit = updatedSplitArray.splice(props.index, 1);

    updatedSplitArray.forEach((split) => {
      split.categoryArray.forEach((category, i) => {
        category.amount += parseMoney(
          splicedSplit[0].categoryArray[i].amount / updatedSplitArray.length,
        );
      });
    });

    setUnsavedSplitArray(updatedSplitArray);
  };

  const updateSplitCategoryAmount = (
    split: SplitClientSide,
    oldAmount: number,
    newAmount: number,
  ) => {
    const change = parseMoney(newAmount - oldAmount);
    let amountToDistribute = change;
    split.categoryArray.forEach((category, index) => {
      const categoryAmount = category.amount || 0;

      if (index === split.categoryArray.length - 1) {
        category.amount = parseMoney(categoryAmount + amountToDistribute);
      } else {
        let share = oldAmount
          ? parseMoney((categoryAmount / oldAmount) * change)
          : parseMoney(change / split.categoryArray.length);

        category.amount = parseMoney(categoryAmount + share);

        amountToDistribute = parseMoney(amountToDistribute - share);
      }
    });
  };

  const changeAmount = (newAmount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);

    updateSplitCategoryAmount(
      updatedSplitArray[props.index],
      splitAmount,
      newAmount,
    );

    if (!transaction) {
      console.error("can not update other split. transaction is undefined.");
      return;
    }

    let unmodifiedSplitArray: SplitClientSide[] = [];
    const modifiedSplitAmountTotal = updatedSplitArray
      .filter((split, index) => {
        if (
          props.modifiedSplitIndexArray.find(
            (modifiedIndex) => modifiedIndex === index,
          ) !== undefined ||
          index === props.index
        ) {
          return split;
        } else {
          unmodifiedSplitArray.push(split);
        }
      })
      .reduce((total, split) => calcSplitAmount(split) + total, 0);

    let remainder = transaction.amount - modifiedSplitAmountTotal;
    unmodifiedSplitArray.forEach((split, index) => {
      if (index === unmodifiedSplitArray.length - 1) {
        updateSplitCategoryAmount(split, calcSplitAmount(split), remainder);
      } else {
        updateSplitCategoryAmount(
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
  };

  return (
    <div className={`flex w-full flex-col gap-y-1 rounded-lg lg:w-fit `}>
      <div className="flex w-full items-center justify-start gap-x-2 ">
        {split.userId === appUser?.id || !props.isManaging ? (
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
                className={
                  isModified ? "outline outline-2 outline-zinc-700" : ""
                }
                id="amount"
                type="number"
                min={0}
                max={transactionAmount}
                value={splitAmount || 0}
                onChange={(e) => {
                  props.setIsManaging(true);

                  if (!isModified) {
                    const updatedArray = structuredClone(
                      props.modifiedSplitIndexArray,
                    );
                    updatedArray.push(props.index);
                    props.setModifiedSplitIndexArray(updatedArray);
                  }
                  const newValue = parseFloat(e.target.value) || 0;

                  changeAmount(newValue);
                }}
                step={0.01}
              />
            </div>

            <div className="flex items-center text-xl">
              <Input
                className="sm:w-20"
                title="ratio"
                id="ratio"
                type="number"
                min={0}
                max={100}
                //0.01 does the same thing 0.01 $ steps
                step={1}
                value={parseMoney((splitAmount / transactionAmount) * 100)}
                onChange={(e) => {
                  props.setIsManaging(true);
                  const prevPercentage = parseMoney(
                    (splitAmount / transactionAmount) * 100,
                  );
                  const updatedPercentage = parseFloat(e.target.value);

                  let updatedSplitAmount = parseMoney(
                    (updatedPercentage / 100) * transactionAmount,
                  );

                  if (splitAmount === updatedSplitAmount) {
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

                  console.log("updatedSplitAmount", updatedSplitAmount);

                  changeAmount(updatedSplitAmount);
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
            {split.categoryArray.map((category, i) => (
              <UserSplitCategory
                setIsManaging={props.setIsManaging}
                splitIndex={props.index}
                categoryIndex={i}
                key={i}
              />
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
