import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";
import { trpc } from "@/util/trpc";
import { Icon } from "@iconify-icon/react";
import { TreedCategory, MergedCategory } from "@/util/types";
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
    const [currentOptionArray, setCurrentOptionArray] = useState<
      TreedCategory[]
    >([]);

    const editingMergedCategory =
      props.unsavedMergedCategoryArray[props.editingMergedCategoryIndex];

    const cleanup = () => {
      if (!categoryOptionArray.data) {
        console.error("cleanup denied. categoryOptionArray.data is undefined.");

        return;
      }

      setCurrentOptionArray(categoryOptionArray.data);
      props.closePicker();
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

      await upsertManySplit.mutateAsync({
        transactionId: transaction.id,
        splitArray: updatedSplitArray,
      });
    };
    /**
     *
     * @param clickedTreedCategory  if the category is assigned by click instead of the "save" button.
     */
    const syncCategory = async (clickedTreedCategory?: TreedCategory) => {
      const updatedMergedCategory = structuredClone(editingMergedCategory);

      if (clickedTreedCategory) {
        //FIX: this only pushes the last name
        updatedMergedCategory.nameArray.push(clickedTreedCategory.name);
      }

      //The only diff between categories inDB and not inDB
      if (editingMergedCategory.nameArray.length === 0) {
        createCategoryForManySplit(updatedMergedCategory.nameArray);
      } else {
        await updateManyCategoryNameArray(updatedMergedCategory.nameArray);
      }

      props.closePicker();

      queryClient.transaction.invalidate();
    };

    useEffect(() => {
      setCurrentOptionArray(categoryOptionArray.data || []);
    }, [categoryOptionArray.data]);

    return (
      <div>
        {categoryOptionArray.data && (
          <div
            ref={ref}
            className="absolute left-0 flex max-h-[50vh] w-full flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 sm:w-96"
            onClick={(e) => e.stopPropagation()}
            style={{ top: props.position.y, left: props.position.x }}
          >
            <div className="flex w-full justify-between px-2 py-1">
              <div className="flex w-fit items-center">
                {categoryOptionArray.data !== currentOptionArray && (
                  <button
                    className="flex"
                    onClick={() => {
                      setCurrentOptionArray(categoryOptionArray.data);
                      cleanup();
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
                      syncCategory();
                    }
                  }}
                >
                  save
                </button>
                <button
                  className="text-pink-300 hover:text-pink-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    cleanup();
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
                      console.debug("syncing");
                      syncCategory(category);
                    } else {
                      setCurrentOptionArray(category.subCategoryArray);
                    }
                  }}
                  key={i}
                  className={
                    "my-1 mr-2 flex aspect-square flex-col items-center justify-center  gap-y-1 hyphens-auto  rounded-lg border border-zinc-400 text-center"
                  }
                >
                  <Icon
                    className={
                      categoryStyleArray[category.name]?.textColor ||
                      "text-zinc-500"
                    }
                    icon={
                      categoryStyleArray[category.name]?.icon ||
                      "material-symbols:category-outline"
                    }
                    height={24}
                  />
                  <p>{category.name}</p>
                  <p className="text-zinc-500">
                    {category.subCategoryArray.length > 0 &&
                      category.subCategoryArray.length + " subcategories"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

CategoryPicker.displayName = "CategoryPicker";

export default CategoryPicker;
