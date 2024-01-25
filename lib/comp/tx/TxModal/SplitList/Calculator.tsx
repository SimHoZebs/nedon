import React from "react";

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

const Calculator = (props: Props) => {
  const onClick = (key: string) => {
    switch (key) {
      case "del":
        props.setValue(props.value.slice(0, -1));
        break;
      case "=":
        props.setValue(eval(props.value));
        break;
      default:
        props.setValue(props.value + key);
        break;
    }
  };

  return (
    <div className="z-10 flex h-[40vh] w-full flex-col items-end rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900">
      <div className="grid h-full w-full grid-rows-4">
        {calcButtons.map((row) => (
          <div key={row.toString()} className="grid h-full w-full grid-cols-4 ">
            {row.map((btn) => (
              <button
                className="flex items-center justify-center hover:cursor-pointer"
                key={btn}
                onClick={() => {
                  onClick(btn);
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
