import React from "react";

export const H1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h1 className={"text-3xl font-bold sm:text-4xl " + className} {...rest}>
      {children}
    </h1>
  );
};

export const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h2 className={"text-2xl font-semibold sm:text-3xl " + className} {...rest}>
      {children}
    </h2>
  );
};

export const H3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h3 className={"text-xl font-semibold sm:text-2xl " + className} {...rest}>
      {children}
    </h3>
  );
};

export const H4 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h4 className={"text-lg font-medium sm:text-xl " + className} {...rest}>
      {children}
    </h4>
  );
};
