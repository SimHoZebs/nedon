import type React from "react";

const AccountCard = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { children, ...rest } = props;
  return (
    <div className="relative flex w-full">
      <button
        type="button"
        className={`z-10 flex w-full justify-between rounded-lg bg-zinc-900 p-4 text-base font-normal sm:text-lg ${
          props.disabled ||
          "hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-100"
        }`}
        {...rest}
      >
        {children}
      </button>
    </div>
  );
};

export default AccountCard;
