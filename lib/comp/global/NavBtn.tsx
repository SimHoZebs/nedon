import type { ButtonProps } from "../shared/Button";

import Link from "next/link";
import type { NextRouter } from "next/router";

interface NavBtnProps extends ButtonProps {
  icon?: string;
  router: NextRouter;
  route: string;
}

export const NavBtn = (props: NavBtnProps) => {
  return (
    <Link
      className={`group flex justify-center gap-x-2 p-3 text-sm transition-all hover:bg-indigo-200 hover:bg-opacity-5 hover:text-indigo-200 sm:w-full sm:justify-start ${
        props.router.pathname === props.route
          ? "bg-indigo-200 bg-opacity-20 text-indigo-200"
          : "text-zinc-300"
      }`}
      href={props.route}
    >
      {props.icon && (
        <span
          className={`h-6 w-6 group-hover:text-indigo-200 ${
            props.router.pathname === props.route
              ? "text-indigo-200"
              : "text-zinc-400"
          } ${props.icon}`}
        />
      )}
      <p className="hidden items-center sm:flex">{props.children}</p>
    </Link>
  );
};
