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
      <div className="relative flex items-center gap-x-2 overflow-x-auto">
        {props.unsavedCategoryArray.map((category, index) => (
          <div
            key={index}
            className="group p-2 rounded-lg flex w-fit items-center gap-x-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
            onClick={() => {
              setSelectedCategory(category);
              setSelectedCategoryIndex(index);
            }}
          >
            <Icon
              className={`flex rounded-full p-1 text-zinc-700 ${
                thisCategoryStyle(index)?.bgColor || "bg-zinc-900 "
              }`}
              icon={thisCategoryStyle(index)?.icon || "mdi:shape-plus-outline"}
              height={24}
            />

            <div className="flex h-full flex-col items-start gap-y-1">
              <p className={unsavedCategory ? "animate-pulse" : ""}>
                {unsavedCategory
                  ? unsavedCategory.categoryTree.join(" > ")
                  : category.categoryTree.join(" > ")}
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
        <div className="sm:relative">
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
