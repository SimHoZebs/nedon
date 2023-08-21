import React from "react";
import Button from "./Button";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "negative";
  rounded?: boolean;
}
const ActionBtn = (props: Props) => {
  const { children, className, variant, ...rest } = props;

  return (
    <Button
      className={`font-semibold text-zinc-900 transition-colors duration-150 hover:text-zinc-950 ${
        variant === "negative"
          ? "bg-pink-400 hover:bg-pink-500"
          : "bg-indigo-500 hover:bg-indigo-600"
      } ${className} ${props.rounded ? "rounded-full" : "rounded-lg"}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default ActionBtn;
