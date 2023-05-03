import React from "react";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, className, ...rest } = props;

  return (
    <button
      className={
        "bg-blue-400 p-2 rounded-lg w-fit disabled:bg-gray-400 " + className
      }
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
