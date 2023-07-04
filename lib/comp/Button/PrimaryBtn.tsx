import React from "react";
import Button from ".";

const PrimaryBtn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return (
    <Button
      className="bg-indigo-400 font-semibold text-zinc-800 hover:bg-indigo-500 hover:text-zinc-900"
      {...rest}
    >
      {children}
    </Button>
  );
};

export default PrimaryBtn;
