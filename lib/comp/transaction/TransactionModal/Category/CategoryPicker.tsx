import React, { useEffect, useState } from "react";
import { trpc } from "../../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import { useStoreState } from "../../../../util/store";
import {
  CategoryClientSide,
  HierarchicalCategory,
  FullTransaction,
} from "../../../../util/types";
import categoryStyle from "../../../../util/categoryStyle";

interface Props {
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
  setUnsavedCategoryArray: React.Dispatch<
    React.SetStateAction<CategoryClientSide[]>
  >;
  unsavedCategory?: CategoryClientSide;
  setUnsavedCategory: React.Dispatch<
    React.SetStateAction<CategoryClientSide | undefined>
  >;
  category: CategoryClientSide;
  categoryIndex: number;
  cleanup: () => void;
}

const CategoryPicker = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const categoryOptionArray = trpc.getCategoryOptionArray.useQuery(undefined, {
    staleTime: Infinity,
  });
  const upsertTransaction = trpc.transaction.upsertManyCategory.useMutation();
  const createTransaction = trpc.transaction.createTransaction.useMutation();
  const queryClient = trpc.useContext();

  const [selectedOptionArray, setSelectedOptionArray] = useState<
    HierarchicalCategory[]
  >([]);

  const cleanup = () => {
    if (!categoryOptionArray.data) return;

    setSelectedOptionArray(categoryOptionArray.data);
    props.cleanup();
  };

  const syncCategory = async (hierarchicalCategory?: HierarchicalCategory) => {
    if (!appUser || !categoryOptionArray.data) return;

    const treeCopy: string[] = [];

    let updatedCategory: CategoryClientSide = {
      ...props.category,
      categoryTree: treeCopy,
    };

    if (props.unsavedCategory) {
      treeCopy.push(...props.unsavedCategory.categoryTree);
      updatedCategory = {
        ...props.unsavedCategory,
        categoryTree: treeCopy,
      };
    }

    if (hierarchicalCategory) treeCopy.push(hierarchicalCategory.name);

    let updatedCategoryArray: CategoryClientSide[] = [
      ...props.transaction.categoryArray,
    ];
    updatedCategoryArray[props.categoryIndex] = updatedCategory;

    //IMPROVE: picker should understand there can be mroe unsaved category than there is saved. The unsaved categoryArray should be mapped through instead.
    //Picker will update category at a time - there should be a useState that keeps track of that.
    if (props.transaction.inDB) {
      const transaction = await upsertTransaction.mutateAsync({
        transactionId: props.transaction.transaction_id,
        categoryArray: updatedCategoryArray,
      });
      updatedCategoryArray = transaction.categoryArray;
    } else {
      const transaction = await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: props.transaction.transaction_id,
        categoryArray: updatedCategoryArray,
      });
      updatedCategoryArray = transaction.categoryArray;
    }
    queryClient.transaction.getTransactionArray.refetch();

    props.setTransaction({
      ...props.transaction,
      categoryArray: updatedCategoryArray,
    });

    props.setUnsavedCategoryArray(updatedCategoryArray);
    cleanup();
  };

  useEffect(() => {
    setSelectedOptionArray(categoryOptionArray.data || []);
  }, [categoryOptionArray.data]);

  return appUser ? (
    <>
      {categoryOptionArray.data && (
        <div
          className="absolute left-0 flex max-h-[50vh] w-full sm:w-96 flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300"
          
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full justify-between px-2 py-1">
            <div className="flex w-fit items-center">
              {categoryOptionArray.data !== selectedOptionArray && (
                <button
                  className="flex"
                  onClick={() => {
                    setSelectedOptionArray(categoryOptionArray.data);
                    props.setUnsavedCategory(undefined);
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
                  syncCategory();
                }}
              >
                save
              </button>
              <button
                className="text-pink-300 hover:text-pink-400"
                onClick={(e) => {
                  e.stopPropagation();
                  cleanup();

                  props.setUnsavedCategoryArray(
                    props.transaction.categoryArray,
                  );
                }}
              >
                cancel
              </button>
            </div>
          </div>

          <hr className="w-full border-zinc-700" />

          <div className="pl-2 pb-1 grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 text-xs ">
            {selectedOptionArray.map((category, i) => (
              <button
                onClick={async () => {
                  if (category.subCategory.length === 0) {
                    console.log("syncing");
                    await syncCategory(category);
                  } else {
                    setSelectedOptionArray(category.subCategory);
                    props.setUnsavedCategory((prev) =>
                      prev
                        ? {
                            ...prev,
                            categoryTree: [...prev.categoryTree, category.name],
                          }
                        : {
                            ...props.category,
                            categoryTree: [category.name],
                          },
                    );
                  }
                }}
                key={i}
                className={
                  "flex flex-col gap-y-1 aspect-square items-center justify-center hyphens-auto  rounded-lg border  border-zinc-400 text-center mr-2 my-1"
                }
              >
                <Icon
                  className={
                    categoryStyle[category.name]?.textColor || "text-zinc-500"
                  }
                  icon={
                    categoryStyle[category.name]?.icon ||
                    "material-symbols:category-outline"
                  }
                  height={24}
                />
                <p>{category.name}</p>
                <p className="text-zinc-500">
                  {category.subCategory.length > 0 &&
                    category.subCategory.length + " subcategories"}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  ) : null;
};

export default CategoryPicker;
