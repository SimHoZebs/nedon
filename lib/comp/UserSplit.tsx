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
      <div>$ split.amount</div>
      <div>{Math.round((split.amount / props.amount) * 100) / 100}%</div>
      <input
        type="range"
        min={0}
        max={split.amount}
        value={split.amount}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          const newSplit = { ...split, amount: newValue };
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
