import React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
}

export const Button = (props: ButtonProps) => {
  const [loading, setLoading] = React.useState(false);
  const { children, className, onClickAsync, ...rest } = props;

  const originalTextColor = className
    ?.split(" ")
    .find((style) => style.startsWith("text-") && style.endsWith("0"));

  return (
    <button
      type="button"
      {...rest}
      className={twMerge(
        `flex items-center justify-center gap-x-1 p-2 text-sm transition-all active:scale-95 disabled:bg-zinc-400 ${className} ${
          loading && "cursor-wait text-transparent hover:text-transparent"
        }`,
      )}
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
          className={`icon-[mdi--loading] absolute h-4 w-4 animate-spin ${
            originalTextColor || "text-zinc-400"
          }`}
        />
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

interface SecondaryBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "small";
}

export const SecondaryBtn = (props: SecondaryBtnProps) => {
  const { children, ...rest } = props;

  return (
    <Button
      {...rest}
      className={`gap-x-1 rounded-lg bg-indigo-600 bg-opacity-20 text-indigo-300 hover:bg-opacity-40 hover:text-indigo-200 ${
        props.variant ? "text-xs" : ""
      }`}
    >
      {children}
    </Button>
  );
};

interface CloseBtnProps {
  onClose: () => void;
  isForMobile?: boolean;
  isForDesktop?: boolean;
}

export const CloseBtn = (props: CloseBtnProps) => {
  return (
    <button
      type="button"
      aria-label="Close"
      className={`m-1 flex h-6 w-6 rounded-full outline-1 outline-zinc-400 hover:outline-pink-400 ${
        props.isForMobile && "lg:hidden"
      } ${props.isForDesktop && "hidden lg:block"}`}
      onClick={props.onClose}
    >
      <span className="icon-[iconamoon--close-fill] h-6 w-6 rounded-full text-zinc-400 hover:text-pink-400" />
    </button>
  );
};

type SplitBtnProps = ButtonProps & {};

export const SplitBtn = (props: SplitBtnProps) => {
  const { children, className, ...rest } = props;
  const [showOptions, setShowOptions] = React.useState(false);

  const childrenArray = React.Children.toArray(children);

  return (
    <div className="relative flex">
      <Button className={`rounded-l-lg bg-indigo-500 ${className}`} {...rest}>
        {childrenArray[0]}
      </Button>
      <div
        className="flex cursor-pointer items-center justify-center rounded-r-lg border-l border-l-zinc-300 bg-indigo-500 p-1"
        onClick={() => setShowOptions(!showOptions)}
        onKeyUp={() => setShowOptions(!showOptions)}
      >
        <span className="icon-[mdi-light--chevron-down]" />
        {showOptions && childrenArray[1]}
      </div>
    </div>
  );
};

type SplitBtnOptionsProps = ButtonProps & {};

export const SplitBtnOptions = (props: SplitBtnOptionsProps) => {
  const { children } = props;

  return (
    <div className="absolute top-10 right-0 z-10 flex flex-col rounded-lg bg-zinc-800 p-1">
      {children}
    </div>
  );
};
