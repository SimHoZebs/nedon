import React, { useState, useEffect, useRef } from "react";
import { MergedCategory, SplitClientSide } from "@/util/types";
import CategoryPicker from "./CategoryPicker";
import { emptyCategory, mergeCategoryArray } from "@/util/category";
import { useStoreState } from "@/util/store";
import CategoryChip from "./CategoryChip";
import { trpc } from "@/util/trpc";

interface Props {
  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: React.Dispatch<React.SetStateAction<SplitClientSide[]>>;
}

const Category = (props: Props) => {
  const { appUser, currentTransaction } = useStoreState((state) => state);

  const { data: transaction } = trpc.transaction.get.useQuery(
    { plaidTransaction: currentTransaction, userId: appUser?.id || "" },
    { enabled: !!currentTransaction && !!appUser?.id }
  );
  const categoryPickerRef = useRef<HTMLDivElement>(null);

  const [unsavedMergedCategoryArray, setUnsavedMergedCategoryArray] = useState(
    mergeCategoryArray(props.unsavedSplitArray)
  );

  //Indicator for if (undefined) and which (number) category is being edited. 'if' is needed for CategoryChip.tsx to highlight the editing category.
  const [editingMergedCategoryIndex, setEditingMergedCategoryIndex] =
    useState<number>();

  //Picker always exists; Modal.tsx hides it with overflow-hidden
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -400, y: 0 });
  const queryClient = trpc.useContext();

  return (
    transaction && (
      <div>
        <div>
          <h4 className="text-lg font-medium">Categories</h4>
          <button
            className="rounded-lg bg-zinc-800 p-2"
            onClick={async (e) => {
              const updatedSplitArray = structuredClone(
                props.unsavedSplitArray
              );

              updatedSplitArray.forEach((split) => {
                split.categoryArray.push(
                  emptyCategory({ amount: 0, splitId: split.id })
                );
                return split;
              });

              props.setUnsavedSplitArray(updatedSplitArray);
              const updatedMergedCategoryArray: MergedCategory[] =
                mergeCategoryArray(updatedSplitArray);

              setUnsavedMergedCategoryArray(updatedMergedCategoryArray);

              //The index is not referenced from the react state as that wouldn't have updated yet (See: batch state update).
              const index = unsavedMergedCategoryArray.length;
              setEditingMergedCategoryIndex(index);

              const pickerOffsets =
                categoryPickerRef.current?.getBoundingClientRect();

              if (!pickerOffsets)
                throw new Error(
                  `pickerOffsets is undefined. categoryPickerRef is: ${categoryPickerRef.current}`
                );

              const clickPositionOffsets =
                e.currentTarget.getBoundingClientRect();
              setPickerPosition({
                x: clickPositionOffsets.right - pickerOffsets?.width,
                y: clickPositionOffsets.bottom + 8,
              });

              await queryClient.transaction.get.refetch();
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

                  const pickerOffsets =
                    categoryPickerRef.current?.getBoundingClientRect();

                  if (!pickerOffsets)
                    throw new Error(
                      `pickerOffsets is undefined. categoryPickerRef is: ${categoryPickerRef.current}`
                    );

                  const offsets = e.currentTarget.getBoundingClientRect();
                  setPickerPosition({
                    x: offsets.right - pickerOffsets?.width,
                    y: offsets.bottom + 8,
                  });
                }}
              />
            ))}
          </div>

          <CategoryPicker
            ref={categoryPickerRef}
            setUnsavedMergedCategoryArray={setUnsavedMergedCategoryArray}
            //Fallback to 0 for initial boundingClient size.
            editingMergedCategory={
              unsavedMergedCategoryArray[editingMergedCategoryIndex || 0]
            }
            editingMergedCategoryIndex={editingMergedCategoryIndex || 0}
            setEditingMergedCategoryIndex={setEditingMergedCategoryIndex}
            position={pickerPosition}
            cleanup={() => {
              setEditingMergedCategoryIndex(undefined);
              setPickerPosition({
                x: -400,
                y: 0,
              });
            }}
          />
        </div>
        <button
          onClick={() =>
            console.log(categoryPickerRef.current?.getBoundingClientRect())
          }
        >
          test
        </button>

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
