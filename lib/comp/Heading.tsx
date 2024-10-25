import type React from "react";
import { twMerge } from "tailwind-merge";

export const H1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h1 className={`text-3xl font-semibold sm:text-4xl ${className}`} {...rest}>
      {children}
    </h1>
  );
};

export const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h2 className={`text-2xl font-bold sm:text-3xl ${className}`} {...rest}>
      {children}
    </h2>
  );
};

export const H3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h3
      className={twMerge(`text-xl font-medium sm:text-2xl ${className}`)}
      {...rest}
    >
      {children}
    </h3>
  );
};

export const H4 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h4 className={`text-lg font-normal sm:text-xl ${className}`} {...rest}>
      {children}
    </h4>
  );
};
