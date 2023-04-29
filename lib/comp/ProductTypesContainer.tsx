import React from "react";

interface Props {
  children?: React.ReactNode | Array<React.ReactNode>;
  productType: string;
}

const TypeContainer: React.FC<Props> = (props) => (
  <div className="flex flex-col w-full items-center">
    <h4 className="font-extrabold w-full">{props.productType}</h4>
    {props.children}
  </div>
);

TypeContainer.displayName = "TypeContainer";

export default TypeContainer;
