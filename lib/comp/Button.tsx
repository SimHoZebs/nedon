import React from "react";

const Button = (props: React.HTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;

  return (
    <button className="bg-blue-400 p-2 rounded-lg w-fit" {...rest}>
      {children}
    </button>
  );
};

export default Button;
