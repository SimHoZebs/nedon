import React from "react";
import Button from "./Button";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "negative";
}
const ActionBtn = (props: Props) => {
  const { children, className, variant, ...rest } = props;

  return (
    <Button
      className={`font-semibold text-zinc-900 hover:text-zinc-950 ${
        variant === "negative"
          ? "bg-pink-400 hover:bg-pink-500"
          : "bg-indigo-500 hover:bg-indigo-600"
      } ${className}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ActionBtn;
