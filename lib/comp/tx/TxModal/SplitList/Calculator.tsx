import React, { ForwardedRef, forwardRef } from "react";

import { useTxStore } from "@/util/txStore";

interface Props {
  setCalculatorPos: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  splitAmount: number;
  changeAmount: (amount: number) => void;
  pos: {
    top: number;
    left: number;
  };
}

const offScreen = { x: -800, y: -800 };

const Calculator = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const tx = useTxStore((state) => state.txOnModal);
    const txAmount = tx ? tx.amount : 0;
    return (
      <div
        className="absolute left-0 z-10 flex max-h-[50vh] flex-col items-end rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900"
        ref={ref}
        style={props.pos}
      >
        <button
          aria-label="Close"
          className={
            "m-1 flex rounded-full outline outline-1 outline-zinc-400 hover:outline-pink-400"
          }
          onClick={() => props.setCalculatorPos(offScreen)}
        >
          <span className="icon-[iconamoon--close-fill] h-6 w-6 rounded-full text-zinc-400 hover:text-pink-400"></span>
        </button>

        <div className="flex">
          <div className="grid grid-cols-3">
            {Array.from({ length: 10 }, (_, i) => 9 - i).map((i) => (
              <span
                className="flex aspect-square items-center justify-center hover:cursor-pointer"
                key={i}
                onClick={() => {
                  props.changeAmount(
                    Math.min(props.splitAmount * 10 + i, txAmount),
                  );
                }}
              >
                {i}
              </span>
            ))}
            <span
              className="flex h-full items-center p-2 text-center text-xs hover:cursor-pointer"
              onClick={() => {
                props.changeAmount(
                  Math.max(Math.floor(props.splitAmount / 10), 0),
                );
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
  },
);

Calculator.displayName = "Calculator";

export default Calculator;
