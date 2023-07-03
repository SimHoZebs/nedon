import React from "react";
import { NextRouter } from "next/router";
import Button from ".";

interface Props extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  router: NextRouter;
  route: string;
}

const NavBtn = (props: Props) => {
  return (
    <Button
      className={`flex justify-center text-zinc-200 hover:bg-zinc-800 sm:w-full sm:justify-start ${
        props.router.pathname === props.route && "bg-zinc-800 text-zinc-100"
      }`}
      onClick={() => props.router.push(props.route)}
    >
      {props.children}
    </Button>
  );
};

export default NavBtn;
