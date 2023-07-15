import React, { useState } from "react";
import {
  CategoryTreeClientSide,
  FullTransaction,
} from "../../../../util/types";
import { Icon } from "@iconify-icon/react";
import Button from "../../../Button/Button";
import CategoryPicker from "./CategoryPicker";
import categoryStyle from "../../../../util/categoryStyle";
import { emptyCategory } from "../../../../util/category";

interface Props {
  unsavedTreeArray: CategoryTreeClientSide[];
  setUnsavedTreeArray: React.Dispatch<
    React.SetStateAction<CategoryTreeClientSide[]>
  >;
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
}

const Category = (props: Props) => {
  const [selectedTree, setSelectedTree] = useState<CategoryTreeClientSide>();
  const [selectedTreeIndex, setSelectedTreeIndex] = useState<number>();
  const [unsavedTree, setUnsavedTree] = useState<CategoryTreeClientSide>();
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const { amount } = props.transaction;
  const thisCategoryStyle = (index: number) => {
    const lastCategoryName =
      props.transaction.categoryTreeArray[index]?.nameArray.slice(-1)[0];
    return categoryStyle[lastCategoryName];
  };

  const categorySplitTotal = props.unsavedTreeArray.reduce(
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

              props.setUnsavedTreeArray((prev) => [...prev, newCategory]);
              setSelectedTreeIndex(props.unsavedTreeArray.length);
              setSelectedTree(newCategory);
            }}
          >
            <Icon icon={"mdi:plus"} width={16} />
            Add category
          </Button>
        </div>

        <div className="relative flex w-full flex-wrap items-center gap-2 ">
          {props.unsavedTreeArray.map((tree, index) => (
            <div
              key={index}
              className="group flex w-fit items-center gap-x-2 rounded-lg p-1 px-3 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 sm:text-sm"
              onClick={(e) => {
                setSelectedTree(tree);
                setSelectedTreeIndex(index);
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
                    index == selectedTreeIndex && unsavedTree
                      ? "animate-pulse"
                      : ""
                  }
                >
                  {index == selectedTreeIndex && unsavedTree
                    ? unsavedTree.nameArray[unsavedTree.nameArray.length - 1]
                    : tree.nameArray[tree.nameArray.length - 1]}
                </p>
                {props.unsavedTreeArray.length > 1 && (
                  <p onClick={(e) => e.stopPropagation()}>
                    ${" "}
                    <input
                      className="w-14 bg-zinc-900 group-hover:bg-zinc-800 "
                      type="number"
                      min={0}
                      value={tree.amount}
                      onChange={(e) => {
                        const updatedTreeArray = [...props.unsavedTreeArray];
                        updatedTreeArray[index].amount = e.target.valueAsNumber;
                        props.setUnsavedTreeArray(updatedTreeArray);
                      }}
                    />
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTree && selectedTreeIndex !== undefined ? (
          <div>
            <CategoryPicker
              position={pickerPosition}
              cleanup={() => {
                setUnsavedTree(undefined);
                setSelectedTreeIndex(undefined);
                setSelectedTree(undefined);
              }}
              setUnsavedTreeArray={props.setUnsavedTreeArray}
              unsavedTree={unsavedTree}
              setUnsavedTree={setUnsavedTree}
              category={selectedTree}
              categoryIndex={selectedTreeIndex}
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
