import React from "react";
import { SplitClientSide } from "../../../util/types";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  split: SplitClientSide;
  amount: number;
  onAmountChange: (amount: number) => void;
}

const UserSplit = (props: Props) => {
  //FIX: Performance is trash
  return (
    <div className="flex w-full items-center justify-between gap-x-2">
      <div>{props.children}</div>

      <input
        className="w-20"
        type="range"
        min={0}
        max={props.amount}
        value={props.split.amount}
        onChange={(e) => props.onAmountChange(parseFloat(e.target.value))}
        step={0.01}
      />

      <div className="flex items-center justify-between">
        $
        <input
          className="w-20 rounded-lg bg-zinc-800 p-1"
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
          className="w-16 rounded-lg bg-zinc-800 p-1"
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
