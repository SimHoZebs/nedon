import React from "react";
import { NextRouter } from "next/router";
import Button from "./Button";
import { Icon } from "@iconify-icon/react";

interface Props extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  router: NextRouter;
  route: string;
}

const NavBtn = (props: Props) => {
  return (
    <Button
      className={`group justify-center gap-x-2 rounded-none hover:text-indigo-200 sm:w-full sm:justify-start ${
        props.router.pathname === props.route
          ? "border-l-2 border-indigo-200 text-indigo-200"
          : "text-zinc-300"
      }`}
      onClick={() => props.router.push(props.route)}
    >
      {props.icon && (
        <Icon
          className={`group-hover:text-indigo-200 ${
            props.router.pathname === props.route
              ? "text-indigo-200"
              : "text-zinc-400"
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
