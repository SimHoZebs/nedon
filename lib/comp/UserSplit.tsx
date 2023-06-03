import { Split } from "@prisma/client";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  split: Split;
  amount: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UserSplit = (props: Props) => {
  //FIX: Performance is trash
  return (
    <div className="flex w-full justify-between gap-x-2">
      <div className="flex w-1/3 justify-between">
        <div>$ {props.split.amount}</div>
        <div>
          {Math.floor((props.split.amount / props.amount) * 10000) / 100}%
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={props.amount * 100}
        value={props.split.amount * 100}
        onChange={props.onChange}
      />
      <div>{props.children}</div>
    </div>
  );
};

export default UserSplit;
