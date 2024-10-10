import type React from "react";

const AccountCard = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;
  return (
    <div className="relative flex w-full">
      <button
        type="button"
        className={`z-10 flex w-full justify-between border border-zinc-300 bg-zinc-900 p-4 text-base sm:text-lg ${
          props.disabled ||
          "hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-100"
        }`}
        {...rest}
      >
        {children}
      </button>
      <div className="absolute left-1 top-1 h-full w-full bg-zinc-700" />
    </div>
  );
};

export default AccountCard;
