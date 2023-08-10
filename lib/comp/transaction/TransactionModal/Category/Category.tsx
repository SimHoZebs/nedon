import React, { useState, useRef } from "react";
import { SplitClientSide } from "@/util/types";
import CategoryPicker from "./CategoryPicker";
import { emptyCategory, mergeCategoryArray } from "@/util/category";
import { useStore } from "@/util/store";
import CategoryChip from "./CategoryChip";
import { trpc } from "@/util/trpc";

const Category = () => {
  const createTransaction = trpc.transaction.create.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManySplit = trpc.split.upsertMany.useMutation();
  const createCategory = trpc.category.create.useMutation();

  const unsavedSplitArray = useStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useStore((state) => state.setUnsavedSplitArray);
  const categoryPickerRef = useRef<HTMLDivElement>(null);

  const appUser = useStore((state) => state.appUser);
  const transaction = useStore((state) => state.transactionOnModal);

  const unsavedMergedCategoryArray = mergeCategoryArray(unsavedSplitArray);

  const createCategoryForManySplit = (nameArray: string[]) => {
    if (!appUser || !transaction) {
      console.error(
        "appUser or transactionOnModal or transaction is undefined."
      );
      return;
    }

    if (!transaction.id) {
      if (editingMergedCategoryIndex === undefined) {
        console.error("editingMergedCategoryIndex is undefined.");
        return;
      }

      const split = structuredClone(unsavedSplitArray[0]);
      split.categoryArray[editingMergedCategoryIndex] = emptyCategory({
        nameArray,
        splitId: split.id,
        amount: 0,
      });

      createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: transaction.transaction_id,
        splitArray: [split],
      });
      return;
    }

    //Only one category may be created at a time, so find is more suitable than filter.
    unsavedSplitArray.forEach(async (unsavedSplit) => {
      if (unsavedSplit.id === null) {
        const split = structuredClone(unsavedSplit);
        split.categoryArray.push(
          emptyCategory({ nameArray, splitId: split.id, amount: 0 })
        );

        //transaction.id boolean was checked before
        createSplit.mutateAsync({ transactionId: transaction.id!, split });

        return;
      }

      await createCategory.mutateAsync({
        splitId: unsavedSplit.id!, // never null because of the if check
        amount: 0,
        nameArray: nameArray,
      });
    });
  };

  const updateManyCategoryNameArray = async (updatedNameArray: string[]) => {
    if (!transaction) return console.error("transaction is undefined.");

    if (!transaction.id) {
      createTransaction.mutateAsync({
        userId: appUser!.id,
        transactionId: transaction.transaction_id,
        splitArray: unsavedSplitArray.map((split) => ({
          ...split,
          categoryArray: split.categoryArray.map((category) => ({
            ...category,
            nameArray: updatedNameArray,
          })),
        })),
      });
      return;
    }

    if (editingMergedCategoryIndex === undefined) {
      console.error("editingMergedCategoryIndex is undefined.");
      return;
    }

    const updatedSplitArray = unsavedSplitArray.map((unsavedSplit) => {
      const updatedSplit = structuredClone(unsavedSplit);

      updatedSplit.categoryArray[editingMergedCategoryIndex].nameArray =
        updatedNameArray;

      return updatedSplit;
    });

    await upsertManySplit.mutateAsync({
      transactionId: transaction.id,
      splitArray: updatedSplitArray,
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
            updateManyCategoryNameArray={updateManyCategoryNameArray}
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
        )}
      </div>
    </div>
  );
};

export default Category;
