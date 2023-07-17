import React, { useEffect, useState } from "react";
import {
  CategoryTreeClientSide,
  FullTransaction,
  MergedCategoryTree,
  SplitClientSide,
} from "../../../../util/types";
import CategoryPicker from "./CategoryPicker";
import {
  emptyCategory,
  mergeCategoryTreeArray,
} from "../../../../util/category";
import { useStoreActions, useStoreState } from "../../../../util/store";
import CategoryChip from "./CategoryChip";

const Category = () => {
  const { currentTransaction: transaction } = useStoreState((state) => state);
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );
  const syncedMergedCategoryArray = mergeCategoryTreeArray(
    transaction ? transaction.splitArray : []
  );

  const [unsavedSplitArray, setUnsavedSplitArray] = useState<SplitClientSide[]>(
    transaction ? structuredClone(transaction.splitArray) : []
  );
  const [unsavedMergedCategoryArray, setUnsavedMergedTreeArray] = useState(
    mergeCategoryTreeArray(unsavedSplitArray)
  );
  const [editingMergedTreeIndex, setEditingMergedCategoryIndex] =
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
                split.categoryTreeArray.push(
                  emptyCategory({ amount: 0, splitId: split.id })
                );
                return split;
              });

              setUnsavedSplitArray(updatedSplitArray);
              const updatedMergedTreeArray: MergedCategoryTree[] =
                mergeCategoryTreeArray(updatedSplitArray);

              setUnsavedMergedTreeArray(updatedMergedTreeArray);
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
            {unsavedMergedCategoryArray.map((tree, index) => (
              <CategoryChip
                key={index}
                isMultiCategory={unsavedMergedCategoryArray.length > 1}
                isEditing={editingMergedTreeIndex === index}
                tree={
                  editingMergedTreeIndex === index
                    ? unsavedMergedCategoryArray[index]
                    : tree
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

          {editingMergedTreeIndex !== undefined ? (
            <div>
              <CategoryPicker
                setUnsavedMergedTreeArray={setUnsavedMergedTreeArray}
                editingMergedCategory={
                  unsavedMergedCategoryArray[editingMergedTreeIndex]
                }
                editingMergedCategoryIndex={editingMergedTreeIndex}
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
