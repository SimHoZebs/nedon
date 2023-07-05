import React from "react";
import Button from ".";

const NegativeBtn = (props: React.HtmlHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return (
    <Button
      className="bg-pink-300 font-semibold text-zinc-800 hover:bg-pink-400 hover:text-zinc-900"
      {...rest}
    >
      {children}
    </Button>
  );
};

export default NegativeBtn;
