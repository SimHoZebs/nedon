import React from "react";
import Button from ".";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "negative";
}
const ActionBtn = (props: Props) => {
  const { children, variant, ...rest } = props;

  return (
    <Button
      className={`font-semibold text-zinc-800 hover:text-zinc-900 ${
        variant === "negative"
          ? "bg-pink-300 hover:bg-pink-400"
          : "bg-indigo-400 hover:bg-indigo-500"
      }`}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ActionBtn;
