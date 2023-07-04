import React from "react";

const AccountCard = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;
  return (
    <button
      className={`flex justify-between rounded-md bg-zinc-800 p-3 text-lg ${
        props.disabled ||
        "hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-100"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default AccountCard;
