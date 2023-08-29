import React from "react";

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className="h-7 w-16 border-b-2 border-zinc-800 bg-zinc-800 p-1 hover:border-zinc-500 focus-visible:outline-none sm:w-24"
      {...props}
    />
  );
};

export default Input;
