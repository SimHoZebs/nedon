import React, { useState } from "react";

import Input from "@/comp/Input";

import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { SplitClientSide } from "@/util/types";

import UserSplitCat from "./UserSplitCat";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
  modifiedSplitIndexArray: number[];
  setModifiedSplitIndexArray: React.Dispatch<React.SetStateAction<number[]>>;
  editingSplitUserIndex: number | undefined;
  setEditingSplitUserIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}

const SplitUser = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const tx = useTxStore((state) => state.txOnModal);
  const screenType = useStore((state) => state.screenType);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const [showDetail, setShowDetail] = useState(false);

  const split = unsavedSplitArray[props.index];
  const splitAmount = calcSplitAmount(split);
  const txAmount = tx ? tx.amount : 0;
  const isModified =
    props.modifiedSplitIndexArray.find(
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
    props.setIsManaging(true);
    props.setEditingSplitUserIndex(props.index);
  };

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

  const changeAmount = (newAmount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);

    updateSplitCatAmount(
      updatedSplitArray[props.index],
      splitAmount,
      newAmount,
    );

    if (!tx) {
      console.error("can not update other split. tx is undefined.");
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

    let remainder = tx.amount - modifiedSplitAmountTotal;
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
                readOnly={screenType === "mobile"}
                id="amount"
                type="number"
                min={0}
                max={txAmount}
                onFocus={onFocus}
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
                  const newValue = Math.min(
                    parseFloat(e.target.value),
                    txAmount,
                  );

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
                value={parseMoney((splitAmount / txAmount) * 100)}
                readOnly={screenType === "mobile"}
                onFocus={onFocus}
                onChange={(e) => {
                  props.setIsManaging(true);
                  const prevPercentage = parseMoney(
                    (splitAmount / txAmount) * 100,
                  );
                  let updatedPercentage = Math.min(
                    parseFloat(e.target.value),
                    100,
                  );

                  let updatedSplitAmount = parseMoney(
                    (updatedPercentage / 100) * txAmount,
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
            {split.catArray.map((cat, i) => (
              <UserSplitCat
                setIsManaging={props.setIsManaging}
                splitIndex={props.index}
                catIndex={i}
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
