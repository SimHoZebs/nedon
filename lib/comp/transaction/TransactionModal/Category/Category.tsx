import React, { useState, useRef } from "react";
import CategoryPicker from "./CategoryPicker";
import { emptyCategory, mergeCategoryArray } from "@/util/category";
import CategoryChip from "./CategoryChip";
import { useTransactionStore } from "@/util/transactionStore";
import { Icon } from "@iconify-icon/react";
import H3 from "@/comp/H3";
import Button from "@/comp/Button/Button";

const Category = () => {
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray
  );
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const categoryPickerRef = useRef<HTMLDivElement>(null);

  const unsavedMergedCategoryArray = mergeCategoryArray(unsavedSplitArray);

  //Indicator for if (undefined) and which (number) category is being edited. 'if' is needed for CategoryChip.tsx to highlight the editing category.
  const [editingMergedCategoryIndex, setEditingMergedCategoryIndex] =
    useState<number>();

  //Picker always exists; Modal.tsx hides it with overflow-hidden
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -400, y: 0 });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex w-full justify-between gap-x-3">
        <H3>Categories</H3>
        <Button
          className="gap-x-1 rounded-lg text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
          onClick={async (e) => {
            const mergedCategoryArrayClone = structuredClone(
              unsavedMergedCategoryArray
            );

            mergedCategoryArrayClone.push(
              emptyCategory({ amount: 0, splitId: null })
            );

            const newCategory = emptyCategory({
              amount: 0,
              splitId: null,
            });

            const updatedSplitArray = structuredClone(unsavedSplitArray).map(
              (split) => {
                split.categoryArray.push(newCategory);
                return split;
              }
            );

            setUnsavedSplitArray(updatedSplitArray);

            //The index is referenced from the clone instead of the react state as they are identical and the react state wouldn't have updated yet (See: batch state update)
            setEditingMergedCategoryIndex(mergedCategoryArrayClone.length - 1);

            //pickerOffset is sometimes undefined if it's outside
            const pickerOffsets =
              categoryPickerRef.current?.getBoundingClientRect();
            if (!pickerOffsets) {
              console.error(
                `pickerOffsets is undefined. categoryPickerRef is: ${categoryPickerRef.current}`
              );
              return;
            }

            const clickPositionOffsets =
              e.currentTarget.getBoundingClientRect();

            setPickerPosition({
              x: clickPositionOffsets.right - pickerOffsets?.width,
              y: clickPositionOffsets.bottom + 8,
            });
          }}
        >
          <Icon icon="mdi:shape-plus-outline" />
          Create category
        </Button>
      </div>

      <div className="flex flex-col gap-y-1">
        <div className="relative flex w-full flex-wrap items-center gap-2 ">
          {unsavedMergedCategoryArray.map((category, index) => (
            <CategoryChip
              key={index}
              isMultiCategory={unsavedMergedCategoryArray.length > 1}
              isEditing={editingMergedCategoryIndex === index}
              mergedCategory={
                editingMergedCategoryIndex === index
                  ? unsavedMergedCategoryArray[index]
                  : category
              }
              findAndSetPickerPosition={(e) => {
                setEditingMergedCategoryIndex(index);

                //pickerOffset is sometimes undefined if it's outside
                const pickerOffsets =
                  categoryPickerRef.current?.getBoundingClientRect();
                if (!pickerOffsets) {
                  console.error;
                  `pickerOffsets is undefined. categoryPickerRef is: ${categoryPickerRef.current}`;

                  return;
                }
                const offsets = e.currentTarget.getBoundingClientRect();
                setPickerPosition({
                  x: offsets.right - pickerOffsets?.width,
                  y: offsets.bottom + 8,
                });
              }}
            />
          ))}
        </div>

        {transaction && (
          <CategoryPicker
            ref={categoryPickerRef}
            //Fallback to 0 for initial boundingClient size.
            unsavedMergedCategoryArray={unsavedMergedCategoryArray}
            editingMergedCategoryIndex={editingMergedCategoryIndex || 0}
            position={pickerPosition}
            closePicker={() => {
              setEditingMergedCategoryIndex(undefined);
              setPickerPosition({
                x: -400,
                y: 0,
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Category;
