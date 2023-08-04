import React, { useState } from "react";
import { Icon } from "@iconify-icon/react";
import { SplitClientSide } from "@/util/types";
import { useStoreState } from "@/util/store";
import { getCategoryStyle } from "@/util/category";

const inputStyle =
  "h-7 w-16 border-b-2 border-zinc-900 bg-zinc-900 p-1 hover:border-zinc-500 focus-visible:outline-none sm:w-24";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  splitTotal: number;
  userId: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  split: SplitClientSide;
  onRemoveUser: () => void;
  isManaging: boolean;
}

const UserSplit = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex w-full justify-between gap-x-2 ">
        {appUser &&
          (props.split.userId === appUser.id || !props.isManaging ? (
            <div className="aspect-square w-5"></div>
          ) : (
            <button
              title="Remove user from split"
              className="group flex w-5"
              onClick={() => props.onRemoveUser()}
            >
              <Icon
                icon="clarity:remove-line"
                className="text-zinc-500 group-hover:text-pink-400"
                width={20}
                height={20}
              />
            </button>
          ))}
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
                max={props.amount}
                value={props.splitTotal}
                onChange={(e) =>
                  props.onAmountChange(parseFloat(e.target.value))
                }
                step={0.01}
              />
            </div>

            <div className="flex items-center text-xl">
              <input
                className={inputStyle}
                type="number"
                min={0}
                max={100}
                value={
                  Math.floor((props.splitTotal / props.amount) * 10000) / 100
                }
                onChange={(e) => {
                  let newAmount = Math.floor(
                    parseFloat(e.target.value) * props.amount
                  );

                  //0.01 percentage increments are negated in Math.floor, requiring manual increment
                  if (newAmount === props.splitTotal * 100) newAmount += 1;

                  props.onAmountChange(newAmount / 100);
                }}
                step={0.01}
              />
              %
            </div>
          </div>

          <p className="text-xs font-light text-zinc-400">
            {props.userId?.slice(0, 8)}
          </p>
        </div>
      </div>

      <button
        className={`group mb-5 flex w-full flex-col justify-center overflow-hidden rounded-b-lg bg-zinc-800 ${
          showDetail || "h-1 hover:m-0 hover:h-fit"
        }`}
        onClick={() => setShowDetail(!showDetail)}
      >
        {showDetail ? (
          <div className="flex w-full flex-col items-center border-x-2 border-t-2 border-zinc-800 bg-zinc-900">
            {props.split.categoryArray.map((category, i) => (
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
                    {category.nameArray[category.nameArray.length - 1]}
                  </p>
                  <p className="text-xs font-light text-zinc-300">
                    ${category.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <div className="m-1 flex h-fit w-full justify-center bg-zinc-800">
          <Icon icon="formkit:open" width={16} height={16} />
        </div>
      </button>
    </div>
  );
};

export default UserSplit;
