import type { ButtonProps } from "../shared/Button";

import Link from "next/link";
import type { NextRouter } from "next/router";
import { twMerge } from "tailwind-merge";

interface NavBtnProps extends ButtonProps {
  icon?: string;
  router: NextRouter;
  route: string;
}

export const NavBtn = (props: NavBtnProps) => {
  return (
    <Link
      className={twMerge(
        `group flex justify-center gap-x-2 rounded p-3 text-sm transition-all hover:bg-indigo-200/5 hover:text-indigo-200 sm:w-full sm:justify-start sm:rounded-none ${
          props.router.pathname === props.route
            ? "bg-indigo-200/20 text-indigo-200"
            : "text-zinc-300"
        } ${props.className}`,
      )}
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
      {props.children}
    </Link>
  );
};
