import React from "react";
import { getCategoryStyle } from "@/util/category";
import { MergedCategory } from "@/util/types";
import { Icon } from "@iconify-icon/react";

type Props = {
  category: MergedCategory;
  findAndSetPickerPosition: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  isMultiCategory: boolean;
  isEditing: boolean;
};

const CategoryChip = (props: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group flex items-center gap-x-1 rounded-lg p-2 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-300 sm:text-sm ${
          props.isEditing && "animate-pulse bg-zinc-700"
        } `}
        onClick={(e) => props.findAndSetPickerPosition(e)}
      >
        <Icon
          className={`flex rounded-full p-1 ${
            getCategoryStyle(props.category.nameArray)?.textColor
          }`}
          icon={
            getCategoryStyle(props.category.nameArray)?.icon ||
            "mdi:shape-plus-outline"
          }
          height={24}
        />

        <div className={"flex h-full flex-col items-start text-zinc-300 "}>
          <p className={props.isEditing ? "animate-pulse" : ""}>
            {props.category.nameArray.at(-1)}
          </p>
          {props.isMultiCategory && (
            <p onClick={(e) => e.stopPropagation()}>
              ${" "}
              <input
                readOnly
                className="w-14 bg-zinc-800 group-hover:bg-zinc-700 "
                type="number"
                min={0}
                value={props.category.amount}
                //on change, the other categories will have to reduce its contribution.
                //Changing value in categories mean changing the amount of category in every contributor
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
