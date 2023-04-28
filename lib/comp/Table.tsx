import React from "react";

import { DataItem, Categories } from "../util/dataUtil";
import Identity from "./Identity";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
  isIdentity: boolean;
}

const Table = (props: Props) => {
  const maxRows = 15;
  // regular table
  const headers = props.categories.map((category, index) => (
    <th key={index} className="">
      {category.title}
    </th>
  ));

  const rows = props.data
    .map((item: DataItem | any, index) => (
      <tr key={index} className="">
        {props.categories.map((category: Categories, index) => (
          <td key={index} className="">
            {item[category.field]}
          </td>
        ))}
      </tr>
    ))
    .slice(0, maxRows);

  return props.isIdentity ? (
    <Identity data={props.data} categories={props.categories} />
  ) : (
    <table className="">
      <thead className="">
        <tr className=""></tr>
      </thead>
      <tbody className=""></tbody>
    </table>
  );
};

Table.displayName = "Table";

export default Table;
