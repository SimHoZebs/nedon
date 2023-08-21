import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";
import { trpc } from "@/util/trpc";
import { Icon } from "@iconify-icon/react";
import { TreedCategory, MergedCategory, SplitInDB } from "@/util/types";
import categoryStyleArray from "@/util/categoryStyle";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { emptyCategory } from "@/util/category";

interface Props {
  unsavedMergedCategoryArray: MergedCategory[];
  editingMergedCategoryIndex: number;
  closePicker: () => void;
  position: { x: number; y: number };
}

const CategoryPicker = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const createCategory = trpc.category.create.useMutation();
    const createSplit = trpc.split.create.useMutation();
    const upsertManySplit = trpc.split.upsertMany.useMutation();
    const createTransaction = trpc.transaction.create.useMutation();
    const categoryOptionArray = trpc.getCategoryOptionArray.useQuery(
      undefined,
      { staleTime: Infinity }
    );
    const queryClient = trpc.useContext();

    const appUser = useStore((state) => state.appUser);
    const transaction = useTransactionStore(
      (state) => state.transactionOnModal
    );
    const refreshDBData = useTransactionStore((state) => state.refreshDBData);
    const unsavedSplitArray = useTransactionStore(
      (state) => state.unsavedSplitArray
    );
    const setUnsavedSplitArray = useTransactionStore(
      (state) => state.setUnsavedSplitArray
    );
    const [unsavedNameArray, setCurrentNameArray] = useState<string[]>([]);
    const [currentOptionArray, setCurrentOptionArray] = useState<
      TreedCategory[]
    >([]);

    const editingMergedCategory =
      props.unsavedMergedCategoryArray[props.editingMergedCategoryIndex];

    const resetPicker = () => {
      setCurrentNameArray([]);

      if (!categoryOptionArray.data) {
        console.error(
          "Can't reset picker. categoryOptionArray is undefined. How did you get here?"
        );
        return;
      }
      if (!transaction) {
        console.error(
          "Can't reset picker. transaction is undefined. How did you get here?"
        );
        return;
      }

      setCurrentOptionArray(categoryOptionArray.data);
    };

    const createCategoryForManySplit = async (nameArray: string[]) => {
      if (!appUser || !transaction) {
        console.error(
          "appUser or transactionOnModal or transaction is undefined."
        );
        return;
      }

      if (!transaction.id) {
        if (props.editingMergedCategoryIndex === undefined) {
          console.error("editingMergedCategoryIndex is undefined.");
          return;
        }

        const split = structuredClone(unsavedSplitArray[0]);
        split.categoryArray[props.editingMergedCategoryIndex] = emptyCategory({
          nameArray,
          splitId: split.id,
          amount: 0,
        });

        const transactionDBData = await createTransaction.mutateAsync({
          userId: appUser.id,
          transactionId: transaction.transaction_id,
          splitArray: [split],
        });

        refreshDBData(transactionDBData);

        return;
      }

      const updatedSplitArray = unsavedSplitArray.map((unsavedSplit) => {
        const split = structuredClone(unsavedSplit);
        split.categoryArray[split.categoryArray.length - 1] = emptyCategory({
          nameArray,
          splitId: split.id,
          amount: 0,
        });

        return split;
      });

      refreshDBData(updatedSplitArray);

      const dbUpdatedSplitArray = await Promise.all(
        updatedSplitArray.map(async (updatedSplit) => {
          if (updatedSplit.id === null) {
            //transaction.id boolean was checked before
            const newSplit = await createSplit.mutateAsync({
              transactionId: transaction.id!,
              split: updatedSplit,
            });

            return newSplit;
          }

          const updatedSplitClone = structuredClone(updatedSplit);
          const newCategory = await createCategory.mutateAsync({
            splitId: updatedSplit.id!, // never null because of the if check
            amount: 0,
            nameArray: nameArray,
          });

          updatedSplitClone.categoryArray[
            updatedSplit.categoryArray.length - 1
          ] = newCategory;

          return updatedSplitClone as SplitInDB;
        })
      );

      refreshDBData(dbUpdatedSplitArray);
    };

    const updateManyCategoryNameArray = async (updatedNameArray: string[]) => {
      if (!transaction) return console.error("transaction is undefined.");

      if (!transaction.id) {
        const transactionDBData = await createTransaction.mutateAsync({
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

        refreshDBData(transactionDBData);
        return;
      }

      if (props.editingMergedCategoryIndex === undefined) {
        console.error("editingMergedCategoryIndex is undefined.");
        return;
      }

      const updatedSplitArray = unsavedSplitArray.map((unsavedSplit) => {
        const updatedSplit = structuredClone(unsavedSplit);

        updatedSplit.categoryArray[props.editingMergedCategoryIndex].nameArray =
          updatedNameArray;

        return updatedSplit;
      });

      refreshDBData(updatedSplitArray);
      const dbUpdatedTransaction = await upsertManySplit.mutateAsync({
        transactionId: transaction.id,
        splitArray: updatedSplitArray,
      });
      refreshDBData(dbUpdatedTransaction);
    };

    /**
     *
     * @param clickedTreedCategory  if the category is assigned by click instead of the "save" button.
     */
    const applyChangesToCategory = async (
      clickedTreedCategory?: TreedCategory
    ) => {
      const updatedMergedCategory = structuredClone(editingMergedCategory);
      const updatedNameArray = structuredClone(unsavedNameArray);

      if (clickedTreedCategory) {
        updatedNameArray.push(clickedTreedCategory.name);
      }
      updatedMergedCategory.nameArray = updatedNameArray;

      //The only diff between categories inDB and not inDB
      if (editingMergedCategory.nameArray.length === 0) {
        await createCategoryForManySplit(updatedMergedCategory.nameArray);
      } else {
        await updateManyCategoryNameArray(updatedMergedCategory.nameArray);
      }

      queryClient.transaction.invalidate();
    };

    useEffect(() => {
      if (!categoryOptionArray.data) {
        categoryOptionArray.status === "loading"
          ? console.debug(
              "Can't sync currentOptionArray. categoryOptionArray is loading."
            )
          : console.error(
              "Can't sync currentOptionArray. fetching categoryOptionArray failed."
            );

        return;
      }

      const filteredOptionArray = categoryOptionArray.data.filter(
        (option) =>
          !props.unsavedMergedCategoryArray.find(
            (unsavedCategory) =>
              unsavedCategory.nameArray.at(-1) === option.name
          )
      );

      setCurrentOptionArray(filteredOptionArray);
    }, [
      categoryOptionArray.data,
      categoryOptionArray.status,
      props.unsavedMergedCategoryArray,
    ]);

    return categoryOptionArray.data ? (
      <div
        ref={ref}
        className="absolute left-0 flex max-h-[50vh] w-full flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900 sm:w-96"
        onClick={(e) => e.stopPropagation()}
        style={{ top: props.position.y, left: props.position.x }}
      >
        <div className="flex w-full justify-between px-2 py-1">
          <div className="flex w-fit items-center">
            {unsavedNameArray.length > 0 && (
              <button
                className="flex"
                onClick={() => {
                  if (!transaction)
                    return console.error(
                      "Can't reset unsavedSplitArray. transaction is undefined."
                    );
                  resetPicker();
                }}
              >
                <Icon icon="mdi:chevron-left" height={24} />
              </button>
            )}
          </div>

          <div className="flex gap-x-2 ">
            <button
              className="text-indigo-300 hover:text-indigo-400"
              onClick={async () => {
                if (editingMergedCategory.id === null) {
                  await applyChangesToCategory();
                  resetPicker();
                  props.closePicker();
                }
              }}
            >
              save
            </button>
            <button
              className="text-pink-400 hover:text-pink-500"
              onClick={(e) => {
                e.stopPropagation();
                if (!transaction)
                  return console.error(
                    "Can't reset unsavedSplitArray. transaction is undefined."
                  );
                setUnsavedSplitArray(transaction.splitArray);
                resetPicker();
                props.closePicker();
              }}
            >
              cancel
            </button>
          </div>
        </div>

        <hr className="w-full border-zinc-700" />

        <div className="grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 pb-1 pl-2 text-xs ">
          {currentOptionArray.map((category, i) => (
            <button
              onClick={async () => {
                if (category.subCategoryArray.length === 0) {
                  await applyChangesToCategory(category);
                  resetPicker();
                  props.closePicker();
                } else {
                  const updatedOptionArray = category.subCategoryArray;

                  const filteredOptionArray = updatedOptionArray.filter(
                    (option) =>
                      !props.unsavedMergedCategoryArray.find(
                        (unsavedCategory) =>
                          unsavedCategory.nameArray.at(-1) === option.name
                      )
                  );

                  setCurrentOptionArray(filteredOptionArray);
                  setCurrentNameArray((prev) => [...prev, category.name]);
                }
              }}
              key={i}
              className={
                "group my-1 mr-2 flex aspect-square flex-col items-center  justify-center gap-y-1  hyphens-auto rounded-lg border border-zinc-400 text-center hover:bg-zinc-700 hover:text-zinc-200"
              }
            >
              <Icon
                className={
                  categoryStyleArray[category.name]?.textColor ||
                  "text-zinc-500 group-hover:text-zinc-400"
                }
                icon={
                  categoryStyleArray[category.name]?.icon ||
                  "material-symbols:category-outline"
                }
                height={24}
              />
              <p>{category.name}</p>
              <p className="text-zinc-500 group-hover:text-zinc-400">
                {category.subCategoryArray.length > 0 &&
                  category.subCategoryArray.length + " subcategories"}
              </p>
            </button>
          ))}
        </div>
      </div>
    ) : null;
  }
);

CategoryPicker.displayName = "CategoryPicker";

export default CategoryPicker;
