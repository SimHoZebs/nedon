import { NextRouter } from "next/router";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
}

export const Button = (props: ButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const { children, className, onClickAsync, ...rest } = props;

  const originalTextColor = className
    ?.split(" ")
    .find((style) => style.startsWith("text-"));

  return (
    <button
      {...rest}
      className={`flex items-center justify-center gap-x-1 p-2 text-sm disabled:bg-zinc-400 ${className} ${
        loading && "cursor-wait text-transparent hover:text-transparent"
      }`}
      onClick={async (e) => {
        if (props.onClick) {
          props.onClick(e);
        }

        if (onClickAsync) {
          setLoading(true);
          await onClickAsync(e);
          setLoading(false);
        }
      }}
    >
      {loading && (
        <span
          className={`icon-[mdi--loading] absolute h-4 w-4 animate-spin ${originalTextColor}`}
        ></span>
      )}
      {children}
    </button>
  );
};

interface ActionBtnProps extends ButtonProps {
  variant?: "primary" | "negative";
  rounded?: boolean;
}

export const ActionBtn = (props: ActionBtnProps) => {
  const { children, className, variant, onClickAsync, ...rest } = props;

  return (
    <Button
      onClickAsync={onClickAsync}
      {...rest}
      className={`font-semibold text-zinc-900 transition-colors duration-150 hover:text-zinc-950 ${
        variant === "negative"
          ? "bg-pink-400 hover:bg-pink-500"
          : "bg-indigo-500 hover:bg-indigo-600"
      } ${className} ${props.rounded ? "rounded-full" : "rounded-lg"}`}
    >
      {children}
    </Button>
  );
};

interface NavBtnProps extends ButtonProps {
  icon?: string;
  router: NextRouter;
  route: string;
}

export const NavBtn = (props: NavBtnProps) => {
  return (
    <Button
      className={`group justify-center gap-x-2 rounded-lg hover:bg-indigo-200 hover:bg-opacity-5 hover:text-indigo-200 sm:w-full sm:justify-start ${
        props.router.pathname === props.route
          ? "bg-indigo-200 bg-opacity-20 text-indigo-200"
          : "text-zinc-300"
      }`}
      onClick={() => props.router.push(props.route)}
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
      <p className="hidden sm:block">{props.children}</p>
    </Button>
  );
};

interface SecondaryBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}

export const SecondaryBtn = (props: SecondaryBtnProps) => {
  const { children, className, variant, ...rest } = props;

  return (
    <Button
      {...rest}
      className={`gap-x-1 rounded-lg bg-indigo-600 bg-opacity-20 font-semibold text-indigo-300 hover:bg-opacity-40 hover:text-indigo-200 ${
        props.variant ? "text-xs" : ""
      }`}
    >
      {children}
    </Button>
  );
};

interface CloseBtnProps {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  isForMobile?: boolean;
}

export const CloseBtn = (props: CloseBtnProps) => {
  return (
    <button
      aria-label="Close"
      className={
        "m-1 rounded-full outline outline-1 outline-zinc-400 hover:outline-pink-400 " +
        (props.isForMobile ? "flex lg:hidden" : "hidden lg:flex")
      }
      onClick={() => props.setShowModal(false)}
    >
      <span className="icon-[iconamoon--close-fill] h-6 w-6 rounded-full text-zinc-400 hover:text-pink-400"></span>
    </button>
  );
};
