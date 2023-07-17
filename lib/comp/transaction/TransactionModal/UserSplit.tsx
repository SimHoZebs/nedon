import React from "react";
import { Icon } from "@iconify-icon/react";
import { SplitClientSide } from "../../../util/types";

const inputStyle =
  "h-7 w-16 border-b-2 border-zinc-900 bg-zinc-900 p-1 hover:border-zinc-500 focus-visible:outline-none sm:w-20";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  splitTotal: number;
  userId: string;
  amount: number;
  onAmountChange: (amount: number) => void;
}

const calcSplitTotal = (split: SplitClientSide) => {
  return split.categoryTreeArray.reduce(
    (total, tree) => total + tree.amount,
    0
  );
};

const UserSplit = (props: Props) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex w-full justify-between gap-x-2 ">
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

      <button className="group mb-4 flex h-0 w-full justify-center overflow-hidden rounded-b-lg bg-zinc-800 p-1 hover:m-0 hover:h-fit">
        <Icon icon="mdi:chevron-down" width={16} />
      </button>
    </div>
  );
};

export default UserSplit;
