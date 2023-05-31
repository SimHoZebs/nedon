import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  splitArray: number[];
  index: number;
  amount: number;
  setSplitArray: React.Dispatch<React.SetStateAction<number[]>>;
}

const UserSplit = (props: Props) => {
  return (
    <div className="flex w-full justify-between gap-x-2">
      <div>
        $ {Math.round(props.amount * props.splitArray[props.index]) / 100}
      </div>
      <div>{props.splitArray[props.index]}%</div>
      <input
        type="range"
        min={0}
        max={100}
        value={props.splitArray[props.index]}
        onChange={(e) => {
          const newValue = parseInt(e.target.value);
          const newSplit = [...props.splitArray];
          newSplit[props.index] = newValue;
          newSplit[props.index === 0 ? 1 : 0] = 100 - newValue;
          props.setSplitArray(newSplit);
        }}
      />
      <div>{props.children}</div>
    </div>
  );
};

export default UserSplit;
