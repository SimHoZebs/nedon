import React from "react";

interface Props {
  children?: React.ReactNode | Array<React.ReactNode>;
  productType: string;
}

const TypeContainer: React.FC<Props> = (props) => (
  <div className="">
    <h4 className=""></h4>
    {props.children}
  </div>
);

TypeContainer.displayName = "TypeContainer";

export default TypeContainer;
