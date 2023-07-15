import React from "react";

const H3 = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { children, className, ...rest } = props;
  return (
    <h3
      className={
        "text-xl font-medium sm:text-2xl sm:font-semibold " + className
      }
      {...rest}
    >
      {children}
    </h3>
  );
};

export default H3;
