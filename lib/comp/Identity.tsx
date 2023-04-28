import React from "react";

import { DataItem, Categories } from "../util/dataUtil";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
}

const Identity = (props: Props) => {
  const identityHeaders = props.categories.map((category, index) => (
    <span key={index} className="">
      {category.title}
    </span>
  ));

  const identityRows = props.data.map((item: DataItem | any, index) => (
    <div key={index} className="">
      {props.categories.map((category: Categories, index) => (
        <span key={index} className="">
          {item[category.field]}
        </span>
      ))}
    </div>
  ));

  return (
    <div className="">
      <div className=""></div>
      <div className=""></div>
    </div>
  );
};

Identity.displayName = "Identity";

export default Identity;
