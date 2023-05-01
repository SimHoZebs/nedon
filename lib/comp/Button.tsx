import React from "react";

const Button = (props: React.HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button className="bg-blue-400 p-2 rounded-lg w-fit">
      {props.children}
    </button>
  );
};

export default Button;
