import React from "react";

import parseMoney from "@/util/parseMoney";

interface Props {
  value: string;
  setValue: (value: string) => void;
}
const calcButtons = [
  ["7", "8", "9", "+"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "*"],
  ["0", "del", "=", "/"],
];
const calcButtonIcons: { [key: string]: string } = {
  "+": "icon-[ic--baseline-plus]",
  "-": "icon-[ic--baseline-minus]",
  "*": "icon-[ic--baseline-close]",
  "/": "icon-[ic--baseline-divide]",
  "=": "icon-[ic--baseline-equals]",
};

const Calculator = (props: Props) => {
  const onClick = (key: string) => {
    switch (key) {
      case "del":
        props.setValue(props.value.slice(0, -1));
        break;
      case "=":
        let evaluation: string;
        try {
          evaluation = eval(props.value);
          if (typeof evaluation === "number") {
            evaluation = parseMoney(evaluation).toString();
          }
        } catch (e) {
          evaluation = parseFloat(props.value).toString();
        }
        props.setValue(evaluation);
        break;
      default:
        props.setValue(props.value + key);
        break;
    }
  };

  return (
    <div className="bottom-1/4 right-60 z-10 flex h-[40vh] w-full flex-col items-end rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900 lg:absolute lg:w-3/12">
      <div className="grid h-full w-full grid-rows-4">
        {calcButtons.map((row) => (
          <div key={row.toString()} className="grid h-full w-full grid-cols-4 ">
            {row.map((btn) => (
              <button
                className={
                  "flex items-center justify-center hover:cursor-pointer " +
                  (btn === "del" ? " text-pink-400 " : "")
                }
                key={btn}
                onClick={() => {
                  onClick(btn);
                }}
              >
                {calcButtonIcons[btn] ? (
                  <span className={calcButtonIcons[btn] + " h-4 w-4"} />
                ) : (
                  btn
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
