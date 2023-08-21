import React from "react";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, className, ...rest } = props;

  return (
    <button
      className={`flex items-center p-2 text-sm disabled:bg-zinc-400 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
