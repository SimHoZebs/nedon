import React from "react";
import { NextRouter } from "next/router";
import Button from ".";
import { Icon } from "@iconify-icon/react";

interface Props extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  router: NextRouter;
  route: string;
}

const NavBtn = (props: Props) => {
  return (
    <Button
      className={`group flex items-center justify-center gap-x-2 hover:bg-zinc-800 sm:w-full sm:justify-start ${
        props.router.pathname === props.route
          ? "bg-zinc-800 text-zinc-200"
          : "text-zinc-300"
      }`}
      onClick={() => props.router.push(props.route)}
    >
      {props.icon && (
        <Icon
          className={`group-hover:text-zinc-400 ${
            props.router.pathname === props.route
              ? "text-zinc-400"
              : "text-zinc-500"
          }`}
          icon={props.icon}
          height={24}
        />
      )}
      <p className="hidden sm:block">{props.children}</p>
    </Button>
  );
};

export default NavBtn;
