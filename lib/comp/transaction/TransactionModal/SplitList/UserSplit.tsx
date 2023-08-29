import React, { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { calcSplitAmount } from "@/util/split";
import UserSplitCategory from "../UserSplitCategory";
import Input from "@/comp/Input";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
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

  const removeUser = () => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    const splicedSplit = updatedSplitArray.splice(props.index, 1);

    updatedSplitArray.forEach((split) => {
      split.categoryArray.forEach((category, i) => {
        category.amount += parseFloat(
          (
            splicedSplit[0].categoryArray[i].amount / updatedSplitArray.length
          ).toFixed(2),
        );
      });
    });

    setUnsavedSplitArray(updatedSplitArray);
  };

  const changeAmount = (amount: number) => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    updatedSplitArray[props.index].categoryArray.forEach((category) => {
      category.amount = parseFloat(
        (amount / updatedSplitArray[props.index].categoryArray.length).toFixed(
          2,
        ),
      );
    });

    setUnsavedSplitArray(updatedSplitArray);
  };

  return (
    <div className="flex flex-col gap-y-1">
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
                id="amount"
                type="number"
                min={0}
                max={transactionAmount}
                value={splitAmount}
                onChange={(e) => changeAmount(parseFloat(e.target.value))}
                step={0.01}
              />
            </div>

            <div className="flex items-center text-xl">
              <Input
                title="ratio"
                id="ratio"
                type="number"
                min={0}
                max={100}
                value={parseFloat(
                  ((splitAmount / transactionAmount) * 100).toFixed(2),
                )}
                onChange={(e) => {
                  const updatedSplitAmount = parseFloat(
                    (
                      (parseFloat(e.target.value) / 100) *
                      transactionAmount
                    ).toFixed(2),
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
