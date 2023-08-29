import React from "react";
import Button from "./Button";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}

const SecondaryBtn = (props: Props) => {
  return (
    <Button
      className={`gap-x-1 rounded-lg bg-indigo-600 bg-opacity-20 font-semibold text-indigo-300 hover:bg-opacity-40 hover:text-indigo-200 ${
        props.variant ? "text-xs" : ""
      }`}
      {...props}
    >
      {props.children}
    </Button>
  );
};

export default SecondaryBtn;