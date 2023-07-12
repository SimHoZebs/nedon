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

  const { amount } = props.transaction;
  const thisCategoryStyle = (index: number) => {
    const lastCategory =
      props.transaction.categoryArray[index]?.categoryTree.slice(-1)[0];
    return categoryStyle[lastCategory];
  };

  const categorySplitTotal = props.unsavedCategoryArray.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  return (
    <>
      <div>
        <div className="relative flex flex-wrap items-center w-full gap-2 ">
          {props.unsavedCategoryArray.map((category, index) => (
            <div
              key={index}
              className="group border border-zinc-700 p-1 px-3 rounded-full flex w-fit items-center gap-x-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 hover:cursor-pointer"
              onClick={() => {
                setSelectedCategory(category);
                setSelectedCategoryIndex(index);
              }}
            >
              <Icon
                className={`flex rounded-full bg-zinc-900 group-hover:bg-zinc-800 p-1 ${thisCategoryStyle(
                  index,
                )?.textColor}`}
                icon={
                  thisCategoryStyle(index)?.icon || "mdi:shape-plus-outline"
                }
                height={24}
              />

              <div className="flex text-zinc-300 h-full flex-col items-start ">
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
                      className="bg-zinc-900 w-14 group-hover:bg-zinc-800 "
                      type="number"
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

      <div className="mt-2 flex gap-x-2 ">
        <Button
          className="bg-zinc-800 hover:bg-zinc-700 hover:text-zinc-200 text-xs flex gap-x-2"
          onClick={() => {
            const newCategory = emptyCategory(
              props.transaction.transaction_id,
              [],
            );

            props.setUnsavedCategoryArray((prev) => [...prev, newCategory]);
            setSelectedCategoryIndex(props.unsavedCategoryArray.length);
            setSelectedCategory(newCategory);
          }}
        >
          <Icon icon={"mdi:shape-plus-outline"} width={16}></Icon>
          Add category
        </Button>
      </div>

      <p className="text-xs h-4 text-pink-300 ">
        {categorySplitTotal !== amount
          ? "Category split total does not match transaction amount"
          : null}
      </p>
    </>
  );
};

export default Category;
