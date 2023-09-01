import { Icon } from "@iconify-icon/react";
import { NextRouter } from "next/router";
import React from "react";

export const Button = (
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
  const { children, className, ...rest } = props;

  return (
    <button
      className={`flex items-center p-2 text-sm disabled:bg-zinc-400 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

interface ActionBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "negative";
  rounded?: boolean;
}

export const ActionBtn = (props: ActionBtnProps) => {
  const { children, className, variant, ...rest } = props;

  return (
    <Button
      className={`font-semibold text-zinc-900 transition-colors duration-150 hover:text-zinc-950 ${
        variant === "negative"
          ? "bg-pink-400 hover:bg-pink-500"
          : "bg-indigo-500 hover:bg-indigo-600"
      } ${className} ${props.rounded ? "rounded-full" : "rounded-lg"}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

interface NavBtnProps extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  router: NextRouter;
  route: string;
}

export const NavBtn = (props: NavBtnProps) => {
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

interface SecondaryBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}

export const SecondaryBtn = (props: SecondaryBtnProps) => {
  return (
    <Button
      className={`gap-x-1 rounded-lg bg-indigo-600 bg-opacity-20 font-semibold text-indigo-300 hover:bg-opacity-40 hover:text-indigo-200 ${
        props.variant ? "text-xs" : ""
      }`}
      {...props}
    >
      {props.children}
    </Button>
  );
};
