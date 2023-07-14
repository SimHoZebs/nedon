import React from "react";

const H1 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h1 className={"text-3xl font-bold sm:text-4xl " + className} {...rest}>
      {children}
    </h1>
  );
};

export default H1;
