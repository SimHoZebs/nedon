import React from "react";
import Button from ".";

const PrimaryBtn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return <Button className="bg-blue-600 hover:bg-blue-700">{children}</Button>;
};

export default PrimaryBtn;
