import { getCategoryStyle } from "@/util/category";
import { CategoryClientSide } from "@/util/types";
import { Icon } from "@iconify-icon/react";
import React from "react";

interface Props {
  category: CategoryClientSide;
}

const UserSplitCategory = (props: Props) => {
  return (
    <div className="my-1 flex items-center gap-x-2">
      <Icon
        className={
          getCategoryStyle(props.category.nameArray).bgColor +
          " rounded-full p-1 text-zinc-900"
        }
        icon={getCategoryStyle(props.category.nameArray).icon}
      />
      <div>
        <p className="text-xs font-light text-zinc-300">
          {props.category.nameArray.at(-1)}
        </p>
        <p className="text-xs font-light text-zinc-300">
          ${props.category.amount}
        </p>
      </div>
    </div>
  );
};

export default UserSplitCategory;
