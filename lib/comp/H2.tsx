import React from "react";

const H2 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h2 className={"text-2xl font-semibold sm:text-3xl " + className} {...rest}>
      {children}
    </h2>
  );
};

export default H2;
