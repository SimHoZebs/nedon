import React, { useState, useRef } from "react";
import { SplitClientSide, isSplitInDB } from "@/util/types";
import CategoryPicker from "./CategoryPicker";
import { emptyCategory, mergeCategoryArray } from "@/util/category";
import { useStore } from "@/util/store";
import CategoryChip from "./CategoryChip";
import { trpc } from "@/util/trpc";

interface Props {
  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: React.Dispatch<React.SetStateAction<SplitClientSide[]>>;
}

const Category = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const currentTransaction = useStore((state) => state.currentTransaction);
  const createTransaction = trpc.transaction.create.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const createCategory = trpc.category.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();
  const { data: transaction } = trpc.transaction.get.useQuery(
    { plaidTransaction: currentTransaction, userId: appUser?.id || "" },
    { enabled: !!currentTransaction && !!appUser?.id }
  );

  const categoryPickerRef = useRef<HTMLDivElement>(null);

  const unsavedMergedCategoryArray = mergeCategoryArray(
    props.unsavedSplitArray
  );

  const createCategoryForManySplit = (nameArray: string[]) => {
    if (!appUser || !currentTransaction || !transaction) {
      console.error(
        "appUser or currentTransaction or transaction is undefined."
      );
      return;
    }

    if (!transaction.inDB) {
      if (editingMergedCategoryIndex === undefined) {
        console.error("editingMergedCategoryIndex is undefined.");
        return;
      }

      const split = structuredClone(props.unsavedSplitArray[0]);
      split.categoryArray[editingMergedCategoryIndex] = emptyCategory({
        nameArray,
        splitId: split.id,
        amount: 0,
      });

      createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: currentTransaction.id,
        splitArray: [split],
      });
      return;
    }

    //Only one category may be created at a time, so find is more suitable than filter.
    props.unsavedSplitArray.forEach(async (unsavedSplit) => {
      if (unsavedSplit.id === null) {
        const split = structuredClone(unsavedSplit);
        split.categoryArray.push(
          emptyCategory({ nameArray, splitId: split.id, amount: 0 })
        );

        createSplit.mutateAsync({ split });

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
    if (!transaction) return console.error("transaction is undefined.");

    if (!transaction.inDB) {
      createTransaction.mutateAsync({
        userId: appUser!.id,
        transactionId: currentTransaction!.id,
        splitArray: props.unsavedSplitArray.map((split) => ({
          ...split,
          categoryArray: split.categoryArray.map((category) => ({
            ...category,
            nameArray: updatedNameArray,
          })),
        })),
      });
      return;
    }

    //TODO: change to upsertMany
    props.unsavedSplitArray.forEach((unsavedSplit) => {
      if (!isSplitInDB(unsavedSplit)) {
        if (editingMergedCategoryIndex === undefined) {
          console.error("editingMergedCategoryIndex is undefined.");
          return;
        }

        const updatedSplit = structuredClone(unsavedSplit);

        updatedSplit.categoryArray[editingMergedCategoryIndex].nameArray =
          updatedNameArray;

        console.log("unsavedSplit", updatedSplit);

        createSplit.mutateAsync({
          split: {
            ...updatedSplit,
          },
        });
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

            props.setUnsavedSplitArray((prev) =>
              prev.map((split) => {
                split.categoryArray.push(newCategory);
                return split;
              })
            );

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
