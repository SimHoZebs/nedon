import React from "react";
import Button from ".";

const NegativeBtn = (props: React.HtmlHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return <Button className="bg-red-800 hover:bg-red-900">{children}</Button>;
};

export default NegativeBtn;
