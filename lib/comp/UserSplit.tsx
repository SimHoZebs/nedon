import { Split } from "@prisma/client";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  split: Split;
  amount: number;
  onAmountChange: (amount: number) => void;
}

const UserSplit = (props: Props) => {
  //FIX: Performance is trash
  return (
    <div className="flex w-full justify-between gap-x-2">
      <div className="flex justify-between">
        $
        <input
          className="bg-zinc-800"
          type="number"
          min={0}
          max={props.amount}
          value={props.split.amount}
          onChange={(e) => props.onAmountChange(parseFloat(e.target.value))}
          step={0.01}
        />
      </div>

      <div className="flex">
        <input
          className="bg-zinc-800 "
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
      <input
        type="range"
        min={0}
        max={props.amount}
        value={props.split.amount}
        onChange={(e) => props.onAmountChange(parseFloat(e.target.value))}
        step={0.01}
      />
      <div>{props.children}</div>
    </div>
  );
};

export default UserSplit;
