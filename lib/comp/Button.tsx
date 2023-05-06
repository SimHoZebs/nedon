import React from "react";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, className, ...rest } = props;

  return (
    <button
      className={
        "bg-blue-500 p-2 rounded-lg w-fit text-zinc-900 font-medium disabled:bg-zinc-400 " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
