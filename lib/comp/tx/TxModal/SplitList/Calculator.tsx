import React from "react";

interface Props {
  onCalculatorBtnPress: (amount: number) => void;
}

const Calculator = (props: Props) => {
  return (
    <div className="left-0 z-10 flex h-[33vh] w-full flex-col items-end rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900">
      <div className="flex h-full w-full">
        <div className="grid h-full w-2/3 grid-cols-3 ">
          {Array.from({ length: 10 }, (_, i) => 9 - i).map((j) => (
            <span
              className="flex items-center justify-center hover:cursor-pointer"
              key={j}
              onClick={() => {
                props.onCalculatorBtnPress(j);
              }}
            >
              {j}
            </span>
          ))}
          <span
            className="flex items-center text-center text-xs hover:cursor-pointer"
            onClick={() => {
              props.onCalculatorBtnPress(-1);
            }}
          >
            del
          </span>
        </div>

        {/* <div className="grid grid-cols-1">
          {["+", "-", "*", "/"].map((arth, i) => (
            <span className="flex items-center p-2" key={i}>
              {arth}
            </span>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Calculator;
