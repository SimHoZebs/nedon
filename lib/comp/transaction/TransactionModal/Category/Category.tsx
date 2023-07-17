import React, { useEffect, useState } from "react";
import { CategoryTreeClientSide } from "../../../../util/types";
import { Icon } from "@iconify-icon/react";
import Button from "../../../Button/Button";
import CategoryPicker from "./CategoryPicker";
import categoryStyle from "../../../../util/categoryStyle";
import { emptyCategory } from "../../../../util/category";
import { useStoreState } from "../../../../util/store";
import Split from "../Split";

const Category = () => {
  const { currentTransaction: transaction } = useStoreState((state) => state);

  const [unsavedTreeArray, setUnsavedTreeArray] = useState<
    CategoryTreeClientSide[]
  >([]);

  const [selectedTree, setSelectedTree] = useState<CategoryTreeClientSide>();
  const [selectedTreeIndex, setSelectedTreeIndex] = useState<number>();
  const [unsavedTree, setUnsavedTree] = useState<CategoryTreeClientSide>();
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const amount = transaction?.amount || 0;
  const thisCategoryStyle = (index: number) => {
    const lastCategoryName =
      transaction?.categoryTreeArray[index].nameArray.slice(-1)[0];

    return lastCategoryName ? categoryStyle[lastCategoryName] : undefined;
  };

  const categorySplitTotal = unsavedTreeArray.reduce(
    (acc, curr) => acc + (curr ? curr.amount : 0),
    0
  );

  useEffect(() => {
    if (!transaction) return;

    setUnsavedTreeArray(transaction.categoryTreeArray);
  }, [transaction]);

  return (
    transaction && (
      <>
        <div className="flex flex-col gap-y-1">
          <div className="flex gap-x-4">
            <Button
              className="flex gap-x-2 bg-zinc-800 text-xs hover:bg-zinc-700 hover:text-zinc-200"
              onClick={() => {
                const newCategory = emptyCategory(
                  transaction.transaction_id,
                  []
                );

                setUnsavedTreeArray((prev) => [...prev, newCategory]);
                setSelectedTreeIndex(unsavedTreeArray.length);
                setSelectedTree(newCategory);
              }}
            >
              <Icon icon={"mdi:edit"} width={16} />
              Manage categorires
            </Button>
          </div>

          <div className="relative flex w-full flex-wrap items-center gap-2 ">
            {unsavedTreeArray.map((tree, index) => (
              <div className="flex flex-col gap-2" key={index}>
                <div
                  className="group flex items-center gap-x-2 rounded-lg p-1 px-3 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-300 sm:text-sm"
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
                        ? unsavedTree.nameArray[
                            unsavedTree.nameArray.length - 1
                          ]
                        : tree.nameArray[tree.nameArray.length - 1]}
                    </p>

                    {unsavedTreeArray.length > 1 && (
                      <p onClick={(e) => e.stopPropagation()}>
                        ${" "}
                        <input
                          className="w-14 bg-zinc-900 group-hover:bg-zinc-800 "
                          type="number"
                          min={0}
                          value={tree.amount}
                          onChange={(e) => {
                            const updatedTreeArray = [...unsavedTreeArray];
                            updatedTreeArray[index].amount =
                              e.target.valueAsNumber;
                            setUnsavedTreeArray(updatedTreeArray);
                          }}
                        />
                      </p>
                    )}
                  </div>
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
                setUnsavedTreeArray={setUnsavedTreeArray}
                unsavedTree={unsavedTree}
                setUnsavedTree={setUnsavedTree}
                category={selectedTree}
                categoryIndex={selectedTreeIndex}
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
    )
  );
};

export default Category;
