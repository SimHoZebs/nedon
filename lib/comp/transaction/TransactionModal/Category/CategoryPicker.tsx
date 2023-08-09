import React, { ForwardedRef, forwardRef, useEffect, useState } from "react";
import { trpc } from "@/util/trpc";
import { Icon } from "@iconify-icon/react";
import { TreedCategory, MergedCategory } from "@/util/types";
import categoryStyleArray from "@/util/categoryStyle";

interface Props {
  createCategoryForManySplit: (nameArray: string[]) => void;
  updateManyCategoryNameArray: (newNameArray: string[]) => Promise<void>;
  unsavedMergedCategoryArray: MergedCategory[];
  editingMergedCategoryIndex: number;
  closePicker: () => void;
  position: { x: number; y: number };
}

const CategoryPicker = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const editingMergedCategory =
      props.unsavedMergedCategoryArray[props.editingMergedCategoryIndex];

    const categoryOptionArray = trpc.getCategoryOptionArray.useQuery(
      undefined,
      {
        staleTime: Infinity,
      }
    );
    const queryClient = trpc.useContext();

    const [currentOptionArray, setCurrentOptionArray] = useState<
      TreedCategory[]
    >([]);

    const cleanup = () => {
      if (!categoryOptionArray.data) {
        console.error("cleanup denied. categoryOptionArray.data is undefined.");

        return;
      }

      setCurrentOptionArray(categoryOptionArray.data);
      props.closePicker();
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
        props.createCategoryForManySplit(updatedMergedCategory.nameArray);
      } else {
        await props.updateManyCategoryNameArray(
          updatedMergedCategory.nameArray
        );
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
