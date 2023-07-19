import React, { useState } from "react";
import { MergedCategory, SplitClientSide } from "@/util/types";
import CategoryPicker from "./CategoryPicker";
import { emptyCategory, mergeCategoryArray } from "@/util/category";
import { useStoreActions, useStoreState } from "@/util/store";
import CategoryChip from "./CategoryChip";

const Category = () => {
  const { currentTransaction: transaction } = useStoreState((state) => state);
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

  const [unsavedSplitArray, setUnsavedSplitArray] = useState<SplitClientSide[]>(
    transaction ? structuredClone(transaction.splitArray) : []
  );
  const [unsavedMergedCategoryArray, setUnsavedMergedCategoryArray] = useState(
    mergeCategoryArray(unsavedSplitArray)
  );
  const [editingMergedCategoryIndex, setEditingMergedCategoryIndex] =
    useState<number>();
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  return (
    transaction && (
      <div>
        <div>
          <h4 className="text-lg font-medium">Categories</h4>
          <button
            onClick={() => {
              const updatedSplitArray = structuredClone(unsavedSplitArray);

              updatedSplitArray.forEach((split) => {
                split.categoryArray.push(
                  emptyCategory({ amount: 0, splitId: split.id })
                );
                return split;
              });

              setUnsavedSplitArray(updatedSplitArray);
              const updatedMergedCategoryArray: MergedCategory[] =
                mergeCategoryArray(updatedSplitArray);

              setUnsavedMergedCategoryArray(updatedMergedCategoryArray);
              //overcoming batch state update
              const index = unsavedMergedCategoryArray.length;
              setEditingMergedCategoryIndex(index);
            }}
          >
            Create category
          </button>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="relative flex w-full flex-wrap items-center gap-2 ">
            {unsavedMergedCategoryArray.map((category, index) => (
              <CategoryChip
                key={index}
                isMultiCategory={unsavedMergedCategoryArray.length > 1}
                isEditing={editingMergedCategoryIndex === index}
                category={
                  editingMergedCategoryIndex === index
                    ? unsavedMergedCategoryArray[index]
                    : category
                }
                categoryChipClick={(e) => {
                  setEditingMergedCategoryIndex(index);
                  const offsets = e.currentTarget.getBoundingClientRect();
                  setPickerPosition({
                    x: offsets.left,
                    y: offsets.bottom + 8,
                  });
                }}
              />
            ))}
          </div>

          {editingMergedCategoryIndex !== undefined ? (
            <div>
              <CategoryPicker
                setUnsavedMergedCategoryArray={setUnsavedMergedCategoryArray}
                editingMergedCategory={
                  unsavedMergedCategoryArray[editingMergedCategoryIndex]
                }
                editingMergedCategoryIndex={editingMergedCategoryIndex}
                setEditingMergedCategoryIndex={setEditingMergedCategoryIndex}
                position={pickerPosition}
                cleanup={() => {
                  setEditingMergedCategoryIndex(undefined);
                }}
              />
            </div>
          ) : null}
        </div>

        <div>
          {/* <p className="h-4 text-xs text-pink-300 ">
            {categorySplitTotal !== amount
              ? `Category total is $ ${categorySplitTotal}, ${
                  categorySplitTotal > amount ? "exceeding" : "short"
                } by $ ${Math.abs(categorySplitTotal - amount)}`
              : null}
          </p> */}
        </div>
      </div>
    )
  );
};

export default Category;
