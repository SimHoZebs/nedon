import React from "react";
import Button from ".";

const NegativeBtn = (props: React.HtmlHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return <Button className="bg-pink-300 hover:bg-pink-400">{children}</Button>;
};

export default NegativeBtn;
