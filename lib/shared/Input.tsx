import type React from "react";
import { twMerge } from "tailwind-merge";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const { className, ...rest } = props;

  return (
    <input
      className={twMerge(
        "h-7 w-20 border-zinc-800 border-b-2 bg-zinc-900 p-1 hover:border-zinc-500 sm:w-36",
        className,
      )}
      {...rest}
    />
  );
};

export default Input;
