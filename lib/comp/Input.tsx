import React from "react";
import { twMerge } from "tailwind-merge";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { className, ...rest } = props;

  return (
    <input
      className={twMerge(
        "h-7 w-20 border-b-2 border-zinc-800 bg-zinc-800 p-1 hover:border-zinc-500 sm:w-36 lg:w-44",
        className,
      )}
      {...rest}
    />
  );
};

export default Input;
