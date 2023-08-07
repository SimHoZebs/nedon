import React, { useState, useRef } from "react";
import { MergedCategory, SplitClientSide, isSplitInDB } from "@/util/types";
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

  const createCategory = trpc.category.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();
  const { data: transaction } = trpc.transaction.get.useQuery(
    { plaidTransaction: currentTransaction, userId: appUser?.id || "" },
    { enabled: !!currentTransaction && !!appUser?.id }
  );

  const categoryPickerRef = useRef<HTMLDivElement>(null);

  const [unsavedMergedCategoryArray, setUnsavedMergedCategoryArray] = useState(
    mergeCategoryArray(props.unsavedSplitArray)
  );

  const createCategoryForManySplit = (nameArray: string[]) => {
    //Only one category may be created at a time, so find is more suitable than filter.
    props.unsavedSplitArray.forEach(async (unsavedSplit, index) => {
      if (unsavedSplit.id === null) {
        console.error(
          "A split not in DB tried to add a category to itself.Its index in unsavedSplitArray is:",
          index
        );
        return;
      }

      await createCategory.mutateAsync({
        splitId: unsavedSplit.id!, // never null because of the if check
        amount: 0,
        nameArray: nameArray,
      });
    });
  };

  const updateManyCategoryNameArray = (updatedNameArray: string[]) => {
    props.unsavedSplitArray.forEach((unsavedSplit) => {
      if (!isSplitInDB(unsavedSplit)) {
        console.error("Split not in DB, can not update category.");
        return;
      }

      const { categoryArray: updatedCategoryArray } =
        structuredClone(unsavedSplit);

      const updatedCategoryIndex = updatedCategoryArray.findIndex(
        (categoryInDB) =>
          categoryInDB.nameArray.join() !== updatedNameArray.join()
      );

      if (updatedCategoryIndex === -1) {
        console.error("target category not found in DB.");
        return;
      }

      updatedCategoryArray[updatedCategoryIndex].nameArray = updatedNameArray;

      upsertManyCategory.mutateAsync({
        categoryArray: updatedCategoryArray,
      });
    });
  };

  //Indicator for if (undefined) and which (number) category is being edited. 'if' is needed for CategoryChip.tsx to highlight the editing category.
  const [editingMergedCategoryIndex, setEditingMergedCategoryIndex] =
    useState<number>();

  //Picker always exists; Modal.tsx hides it with overflow-hidden
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>({ x: -400, y: 0 });

  return (
    transaction && (
      <div>
        <div>
          <h4 className="text-lg font-medium">Categories</h4>
          <button
            className="rounded-lg bg-zinc-800 p-2"
            onClick={async (e) => {
              const mergedCategoryArrayClone = structuredClone(
                unsavedMergedCategoryArray
              );

              mergedCategoryArrayClone.push(
                emptyCategory({ amount: 0, splitId: null })
              );

              setUnsavedMergedCategoryArray(mergedCategoryArrayClone);

              //The index is referenced from the clone instead of the react state as they are identical and the react state wouldn't have updated yet (See: batch state update)
              const index = mergedCategoryArrayClone.length - 1;
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
            updateCategoryNameArrayForAllSplit={updateManyCategoryNameArray}
            createCategoryForManySplit={createCategoryForManySplit}
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
