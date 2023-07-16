import React from "react";
import { SplitClientSide } from "../../../util/types";
import { Icon } from "@iconify-icon/react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  split: SplitClientSide;
  amount: number;
  onAmountChange: (amount: number) => void;
}

const UserSplit = (props: Props) => {
  return (
    <div className="flex w-full items-center justify-between ">
      <div>{props.children}</div>

      <div className="flex items-center justify-between gap-x-2">
        {/**Button to choose categories and amount; only if there is more than one */}
        <button className="flex items-center gap-x-2 rounded-full bg-zinc-800 p-2 text-xs text-indigo-300">
          <Icon
            icon="mdi:shape-plus-outline"
            className="text-indigo-300"
            width={16}
          />
          category
        </button>

        <label htmlFor="amount text-lg">$</label>
        <input
          id="amount"
          className="w-16 border-b border-zinc-900 bg-zinc-900 p-1 text-lg hover:border-zinc-500 sm:w-20"
          type="number"
          min={0}
          max={props.amount}
          value={props.split.amount}
          onChange={(e) => props.onAmountChange(parseFloat(e.target.value))}
          step={0.01}
        />
      </div>

      <div className="flex items-center">
        <input
          className="w-16 border-b border-zinc-900 bg-zinc-900 p-1 hover:border-zinc-500 sm:w-20"
          type="number"
          min={0}
          max={100}
          value={Math.floor((props.split.amount / props.amount) * 10000) / 100}
          onChange={(e) => {
            let newAmount = Math.floor(
              parseFloat(e.target.value) * props.amount
            );

            //0.01 percentage increments are negated in Math.floor, requiring manual increment
            if (newAmount === props.split.amount * 100) newAmount += 1;

            props.onAmountChange(newAmount / 100);
          }}
          step={0.01}
        />
        %
      </div>
    </div>
  );
};

export default UserSplit;
