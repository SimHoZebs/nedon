import React from "react";
import { getCategoryStyle } from "@/util/category";
import { MergedCategory, isCategoryInSplitInDB } from "@/util/types";
import { Icon } from "@iconify-icon/react";
import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";
import { Category } from "@prisma/client";

type Props = {
  mergedCategory: MergedCategory;
  findAndSetPickerPosition: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
  isMultiCategory: boolean;
  isEditing: boolean;
};

const CategoryChip = (props: Props) => {
  const transaction = useTransactionStore((store) => store.transactionOnModal);
  const unsavedSplitArray = useTransactionStore(
    (store) => store.unsavedSplitArray
  );
  const refreshDBData = useTransactionStore((store) => store.refreshDBData);
  const deleteManyCategory = trpc.category.deleteMany.useMutation();
  const queryClient = trpc.useContext();

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group flex items-center gap-x-1 rounded-lg p-2 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-300 sm:text-sm ${
          props.isEditing && "animate-pulse bg-zinc-700"
        } `}
        onClick={(e) => props.findAndSetPickerPosition(e)}
      >
        <Icon
          className={`flex rounded-full p-1 ${
            getCategoryStyle(props.mergedCategory.nameArray)?.textColor
          }`}
          icon={
            getCategoryStyle(props.mergedCategory.nameArray)?.icon ||
            "mdi:shape-plus-outline"
          }
          height={24}
        />

        <div
          className={"group flex h-full flex-col items-start text-zinc-300 "}
        >
          <div className="flex w-full justify-between gap-x-2">
            <p className={props.isEditing ? "animate-pulse" : ""}>
              {props.mergedCategory.nameArray.at(-1)}
            </p>

            {
              //not using unsavedSplitArray as this should only appear when there is more than one SAVED category.
              transaction &&
                transaction.splitArray[0].categoryArray.length > 1 && (
                  <button
                    className="h-3 w-3"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!transaction.id) {
                        console.error(
                          "Unable to delete category; this transaction does not exist in db."
                        );
                        return;
                      }

                      const categoryToDeleteArray: Category[] = [];
                      const updatedSplitArray = unsavedSplitArray.map(
                        (split) => {
                          const updatedCategoryArray =
                            split.categoryArray.filter((category) => {
                              if (
                                category.nameArray.join() !==
                                props.mergedCategory.nameArray.join()
                              ) {
                                return category;
                              } else {
                                if (!isCategoryInSplitInDB(category)) {
                                  console.error(
                                    "Can't add this category to toDeleteArray. It does not have id. category:",
                                    category
                                  );
                                  return;
                                }

                                categoryToDeleteArray.push(category);
                              }
                            });

                          return {
                            ...split,
                            categoryArray: updatedCategoryArray,
                          };
                        }
                      );

                      refreshDBData(updatedSplitArray);

                      deleteManyCategory.mutateAsync({
                        categoryArray: categoryToDeleteArray,
                      });
                      queryClient.transaction.invalidate();
                    }}
                  >
                    <Icon
                      icon="iconamoon:close-fill"
                      width={12}
                      height={12}
                      className="hidden rounded-full text-zinc-400 outline outline-1 hover:text-pink-400 group-hover:block"
                    />
                  </button>
                )
            }
          </div>

          {props.isMultiCategory && (
            <p onClick={(e) => e.stopPropagation()}>
              ${" "}
              <input
                readOnly
                className="w-14 bg-zinc-800 group-hover:bg-zinc-700 "
                type="number"
                min={0}
                value={props.mergedCategory.amount}
                //on change, the other categories will have to reduce its contribution.
                //Changing value in categories mean changing the amount of category in every contributor
                // onChange={(e) => {
                //   const updatedCategoryArray = [...unsavedCategoryArray];
                //   updatedCategoryArray[index].amount = e.target.valueAsNumber;
                //   setUnsavedCategoryArray(updatedCategoryArray);
                // }}
              />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryChip;
