import React, { useState } from "react";
import { CategoryClientSide, FullTransaction } from "../../../../util/types";
import { Icon } from "@iconify-icon/react";
import Button from "../../../Button";
import CategoryPicker from "./CategoryPicker";
import categoryStyle from "../../../../util/categoryStyle";
import { emptyCategory } from "../../../../util/category";

interface Props {
  unsavedCategoryArray: CategoryClientSide[];
  setUnsavedCategoryArray: React.Dispatch<
    React.SetStateAction<CategoryClientSide[]>
  >;
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
}

const Category = (props: Props) => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryClientSide>();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>();
  const [unsavedCategory, setUnsavedCategory] = useState<CategoryClientSide>();
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const { amount } = props.transaction;
  const thisCategoryStyle = (index: number) => {
    const lastCategory =
      props.transaction.categoryArray[index]?.categoryTree.slice(-1)[0];
    return categoryStyle[lastCategory];
  };

  const categorySplitTotal = props.unsavedCategoryArray.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <div className="flex gap-x-4">
          <h4 className="text-lg font-medium">Categories</h4>
          <Button
            className="flex gap-x-2 bg-zinc-800 text-xs hover:bg-zinc-700 hover:text-zinc-200"
            onClick={() => {
              const newCategory = emptyCategory(
                props.transaction.transaction_id,
                []
              );

              props.setUnsavedCategoryArray((prev) => [...prev, newCategory]);
              setSelectedCategoryIndex(props.unsavedCategoryArray.length);
              setSelectedCategory(newCategory);
            }}
          >
            <Icon icon={"mdi:plus"} width={16} />
            Add category
          </Button>
        </div>

        <div className="relative flex w-full flex-wrap items-center gap-2 ">
          {props.unsavedCategoryArray.map((category, index) => (
            <div
              key={index}
              className="group flex w-fit items-center gap-x-2 rounded-lg p-1 px-3 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 sm:text-sm"
              onClick={(e) => {
                setSelectedCategory(category);
                setSelectedCategoryIndex(index);
                const offsets = e.currentTarget.getBoundingClientRect();
                setPickerPosition({
                  x: offsets.left,
                  y: offsets.bottom + 8,
                });
              }}
            >
              <Icon
                className={`flex rounded-full bg-zinc-900 p-1 group-hover:bg-zinc-800 ${
                  thisCategoryStyle(index)?.textColor
                }`}
                icon={
                  thisCategoryStyle(index)?.icon || "mdi:shape-plus-outline"
                }
                height={24}
              />

              <div className="flex h-full flex-col items-start text-zinc-300 ">
                <p
                  className={
                    index == selectedCategoryIndex && unsavedCategory
                      ? "animate-pulse"
                      : ""
                  }
                >
                  {index == selectedCategoryIndex && unsavedCategory
                    ? unsavedCategory.categoryTree[
                        unsavedCategory.categoryTree.length - 1
                      ]
                    : category.categoryTree[category.categoryTree.length - 1]}
                </p>
                {props.unsavedCategoryArray.length > 1 && (
                  <p onClick={(e) => e.stopPropagation()}>
                    ${" "}
                    <input
                      className="w-14 bg-zinc-900 group-hover:bg-zinc-800 "
                      type="number"
                      min={0}
                      value={category.amount}
                      onChange={(e) => {
                        const updatedCategoryArray = [
                          ...props.unsavedCategoryArray,
                        ];
                        updatedCategoryArray[index].amount =
                          e.target.valueAsNumber;
                        props.setUnsavedCategoryArray(updatedCategoryArray);
                      }}
                    />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedCategory && selectedCategoryIndex !== undefined ? (
          <div>
            <CategoryPicker
              position={pickerPosition}
              cleanup={() => {
                setUnsavedCategory(undefined);
                setSelectedCategoryIndex(undefined);
                setSelectedCategory(undefined);
              }}
              setUnsavedCategoryArray={props.setUnsavedCategoryArray}
              unsavedCategory={unsavedCategory}
              setUnsavedCategory={setUnsavedCategory}
              category={selectedCategory}
              categoryIndex={selectedCategoryIndex}
              setTransaction={props.setTransaction}
              transaction={props.transaction}
            />
          </div>
        ) : null}
      </div>

      <div>
        <p className="h-4 text-xs text-pink-300 ">
          {categorySplitTotal !== amount
            ? `Category total is $ ${categorySplitTotal}, ${
                categorySplitTotal > amount ? "exceeding" : "short"
              } by $ ${Math.abs(categorySplitTotal - amount)}`
            : null}
        </p>
      </div>
    </>
  );
};

export default Category;
