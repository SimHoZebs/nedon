import React, { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { useStore } from "@/util/store";
import { getCategoryStyle } from "@/util/category";
import { useTransactionStore } from "@/util/transactionStore";
import { calcSplitAmount } from "@/util/split";

const inputStyle =
  "h-7 w-16 border-b-2 border-zinc-800 bg-zinc-800 p-1 hover:border-zinc-500 focus-visible:outline-none sm:w-24";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  isManaging: boolean;
}

const UserSplit = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray
  );
  const [showDetail, setShowDetail] = useState(false);

  const split = unsavedSplitArray[props.index];
  const splitAmount = calcSplitAmount(split);
  const transactionAmount = transaction ? transaction.amount : 0;

  const removeUser = () => {
    const updatedSplitArray = structuredClone(unsavedSplitArray);
    const splicedSplit = updatedSplitArray.splice(props.index, 1);
    const amount = splicedSplit[0].categoryArray.reduce(
      (total, category) => total + category.amount,
      0
    );

    updatedSplitArray.forEach((split) => {
      split.categoryArray.forEach((category) => {
        category.amount += parseFloat(
          (amount / updatedSplitArray.length).toFixed(2)
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
          2
        )
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
              <input
                id="amount"
                className={inputStyle}
                type="number"
                min={0}
                max={transactionAmount}
                value={splitAmount}
                onChange={(e) => changeAmount(parseFloat(e.target.value))}
                step={0.01}
              />
            </div>

            <div className="flex items-center text-xl">
              <input
                title="ratio"
                id="ratio"
                className={inputStyle}
                type="number"
                min={0}
                max={100}
                value={parseFloat(
                  ((splitAmount / transactionAmount) * 100).toFixed(2)
                )}
                onChange={(e) => {
                  const updatedSplitAmount = parseFloat(
                    (
                      (parseFloat(e.target.value) / 100) *
                      transactionAmount
                    ).toFixed(2)
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
        className={`group mb-5 flex w-full flex-col justify-center overflow-hidden rounded-b-lg bg-zinc-700 ${
          showDetail || "h-1 hover:m-0 hover:h-fit"
        }`}
        onClick={() => setShowDetail(!showDetail)}
      >
        {showDetail && (
          <div className="flex w-full flex-col items-center border-x-2 border-t-2 border-zinc-700 bg-zinc-800">
            {split.categoryArray.map((category, i) => (
              <div className="my-1 flex items-center gap-x-1" key={i}>
                <Icon
                  className={
                    getCategoryStyle(category.nameArray).bgColor +
                    " rounded-full p-1 text-zinc-900"
                  }
                  icon={getCategoryStyle(category.nameArray).icon}
                />
                <div>
                  <p className="text-xs font-light text-zinc-300">
                    {category.nameArray.at(-1)}
                  </p>
                  <p className="text-xs font-light text-zinc-300">
                    ${category.amount}
                  </p>
                </div>
              </div>
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
