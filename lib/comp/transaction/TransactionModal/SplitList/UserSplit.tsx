import React, { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { calcSplitAmount } from "@/util/split";
import UserSplitCategory from "../UserSplitCategory";
import Input from "@/comp/Input";
import parseMoney from "@/util/parseMoney";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
  modifiedSplitIndexArray: number[];
  setModifiedSplitIndexArray: React.Dispatch<React.SetStateAction<number[]>>;
}

const UserSplit = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
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

  const changeAmount = (newAmount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    const change = splitAmount
      ? parseMoney(newAmount - splitAmount)
      : newAmount;

    let amountToDistribute = change;
    updatedSplitArray[props.index].categoryArray.forEach((category, index) => {
      const categoryAmount = category.amount || 0;

      if (index === updatedSplitArray[props.index].categoryArray.length - 1) {
        category.amount = parseMoney(categoryAmount + amountToDistribute);
      } else {
        let share = splitAmount
          ? parseMoney((categoryAmount / splitAmount) * change)
          : parseMoney(
              change / updatedSplitArray[props.index].categoryArray.length,
            );

        category.amount = parseMoney(categoryAmount + share);

        amountToDistribute = parseMoney(amountToDistribute - share);
      }
    });

    setUnsavedSplitArray(updatedSplitArray);
  };

  return (
    <div className={`flex flex-col gap-y-1 p-2 rounded-lg `}>
      <div className="flex w-full justify-between gap-x-2 ">
        {split.userId === appUser?.id || !props.isManaging ? (
          <div className="aspect-square w-5"></div>
        ) : (
          <button
            title="Remove user from split"
            className="group flex w-5"
            onClick={() => removeUser()}
          >
            <Icon
              icon="clarity:remove-line"
              className="text-zinc-500 group-hover:text-pink-400"
              width={20}
              height={20}
            />
          </button>
        )}
        <div>{props.children}</div>

        <div>
          <div className="flex gap-x-2">
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
                value={splitAmount}
                onChange={(e) => {
                  props.setIsManaging(true);

                  if (!isModified) {
                    const updatedArray = structuredClone(
                      props.modifiedSplitIndexArray,
                    );
                    updatedArray.push(props.index);
                    props.setModifiedSplitIndexArray(updatedArray);
                  }

                  changeAmount(parseFloat(e.target.value));
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
                value={parseMoney((splitAmount / transactionAmount) * 100)}
                onChange={(e) => {
                  props.setIsManaging(true);
                  const updatedSplitAmount = parseMoney(
                    (parseFloat(e.target.value) / 100) * transactionAmount,
                  );

                  changeAmount(updatedSplitAmount);
                }}
                step={0.01}
              />
              <label htmlFor="ratior">%</label>
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
          <Icon icon="formkit:open" width={16} height={16} />
        </div>
      </button>
    </div>
  );
};

export default UserSplit;
