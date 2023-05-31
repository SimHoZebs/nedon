import React from "react";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, className, ...rest } = props;

  return (
    <button
      className={
        "w-fit rounded-lg bg-blue-500 p-2 font-medium text-zinc-900 disabled:bg-zinc-400 " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
