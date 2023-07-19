import React from "react";
import { getCategoryStyle } from "@/util/category";
import { MergedCategory } from "@/util/types";
import { Icon } from "@iconify-icon/react";

type Props = {
  category: MergedCategory;
  categoryChipClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  isMultiCategory: boolean;
  isEditing: boolean;
};

const CategoryChip = (props: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="group flex items-center gap-x-2 rounded-lg p-1 px-3 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 sm:text-sm"
        onClick={(e) => props.categoryChipClick(e)}
      >
        <Icon
          className={`flex rounded-full bg-zinc-900 p-1 group-hover:bg-zinc-800 ${
            getCategoryStyle(props.category.nameArray)?.textColor
          }`}
          icon={
            getCategoryStyle(props.category.nameArray)?.icon ||
            "mdi:shape-plus-outline"
          }
          height={24}
        />

        <div className="flex h-full flex-col items-start text-zinc-300 ">
          <p className={props.isEditing ? "animate-pulse" : ""}>
            {props.category.nameArray[props.category.nameArray.length - 1]}
          </p>
          {props.isMultiCategory && (
            <p onClick={(e) => e.stopPropagation()}>
              ${" "}
              <input
                className="w-14 bg-zinc-900 group-hover:bg-zinc-800 "
                type="number"
                min={0}
                value={props.category.amount}
                // onChange={(e) => {
                //   const updatedCategoryArray = [...unsavedCategoryArray];
                //   updatedCategoryArray[index].amount = e.target.valueAsNumber;
                //   setUnsavedCategoryArray(updatedCategoryArray);
                // }}
              />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryChip;
