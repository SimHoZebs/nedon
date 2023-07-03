import React from "react";
import { NextRouter } from "next/router";

interface Props extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  router: NextRouter;
  route: string;
}

const NavButton = (props: Props) => {
  return (
    <button
      className={`flex w-fit justify-center rounded-md p-2 text-zinc-100 hover:bg-zinc-800 sm:w-full sm:justify-start ${
        props.router.pathname === props.route ? "bg-zinc-800 text-zinc-100" : ""
      }`}
      onClick={() => props.router.push(props.route)}
    >
      {props.children}
    </button>
  );
};

export default NavButton;
