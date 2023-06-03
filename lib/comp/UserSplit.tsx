import { Split } from "@prisma/client";
import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  splitArray: Split[];
  index: number;
  amount: number;
  setSplitArray: React.Dispatch<React.SetStateAction<Split[]>>;
}

const UserSplit = (props: Props) => {
  const split = props.splitArray[props.index];

  return (
    <div className="flex w-full justify-between gap-x-2">
      <div className="flex w-1/3 justify-between">
        <div>$ {split.amount}</div>
        <div>{Math.floor((split.amount / props.amount) * 10000) / 100}%</div>
      </div>
      <input
        type="range"
        min={0}
        max={props.amount * 100}
        value={split.amount * 100}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          const newSplit: Split = { ...split, amount: newValue / 100 };
          const newSplitArray = [...props.splitArray];
          newSplitArray[props.index] = newSplit;
          props.setSplitArray(newSplitArray);
        }}
      />
      <div>{props.children}</div>
    </div>
  );
};

export default UserSplit;
