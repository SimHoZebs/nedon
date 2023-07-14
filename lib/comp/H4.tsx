import React from "react";

const H4 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h4 className={"text-lg font-medium sm:text-xl " + className} {...rest}>
      {children}
    </h4>
  );
};

export default H4;
