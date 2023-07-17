import React, { useEffect, useState } from "react";
import { trpc } from "../../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import { useStoreActions, useStoreState } from "../../../../util/store";
import {
  CategoryTreeClientSide,
  HierarchicalCategory,
  FullTransaction,
} from "../../../../util/types";
import categoryStyle from "../../../../util/categoryStyle";

interface Props {
  setUnsavedTreeArray: React.Dispatch<
    React.SetStateAction<CategoryTreeClientSide[]>
  >;
  unsavedTree?: CategoryTreeClientSide;
  setUnsavedTree: React.Dispatch<
    React.SetStateAction<CategoryTreeClientSide | undefined>
  >;
  category: CategoryTreeClientSide;
  categoryIndex: number;
  cleanup: () => void;
  position: { x: number; y: number };
}

const CategoryPicker = (props: Props) => {
  const { appUser, currentTransaction } = useStoreState((state) => state);
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

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
    if (!appUser || !categoryOptionArray.data || !currentTransaction) return;

    const nameArrayCopy: string[] = [];

    let updatedCategory: CategoryTreeClientSide = {
      ...props.category,
      nameArray: nameArrayCopy,
    };

    if (props.unsavedTree) {
      nameArrayCopy.push(...props.unsavedTree.nameArray);
      updatedCategory = {
        ...props.unsavedTree,
        nameArray: nameArrayCopy,
      };
    }

    if (hierarchicalCategory) nameArrayCopy.push(hierarchicalCategory.name);

    let updatedTreeArray: CategoryTreeClientSide[] = [
      ...currentTransaction.categoryTreeArray,
    ];
    updatedTreeArray[props.categoryIndex] = updatedCategory;

    if (currentTransaction.inDB) {
      const transaction = await upsertTransaction.mutateAsync({
        transactionId: currentTransaction.transaction_id,
        categoryTreeArray: updatedTreeArray,
      });
      updatedTreeArray = transaction.categoryTreeArray;
    } else {
      const transaction = await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: currentTransaction.transaction_id,
        categoryTreeArray: updatedTreeArray,
      });
      updatedTreeArray = transaction.categoryTreeArray;
    }
    queryClient.transaction.getTransactionArray.refetch();

    setTransaction(() => ({
      ...currentTransaction,
      categoryTreeArray: updatedTreeArray,
    }));

    props.setUnsavedTreeArray(updatedTreeArray);
    cleanup();
  };

  useEffect(() => {
    setSelectedOptionArray(categoryOptionArray.data || []);
  }, [categoryOptionArray.data]);

  return appUser && currentTransaction ? (
    <>
      {categoryOptionArray.data && (
        <div
          className="absolute left-0 flex max-h-[50vh] w-full flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 sm:w-96"
          onClick={(e) => e.stopPropagation()}
          style={{ top: props.position.y, left: props.position.x }}
        >
          <div className="flex w-full justify-between px-2 py-1">
            <div className="flex w-fit items-center">
              {categoryOptionArray.data !== selectedOptionArray && (
                <button
                  className="flex"
                  onClick={() => {
                    setSelectedOptionArray(categoryOptionArray.data);
                    props.setUnsavedTree(undefined);
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

                  props.setUnsavedTreeArray(
                    currentTransaction.categoryTreeArray
                  );
                }}
              >
                cancel
              </button>
            </div>
          </div>

          <hr className="w-full border-zinc-700" />

          <div className="grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 pb-1 pl-2 text-xs ">
            {selectedOptionArray.map((category, i) => (
              <button
                onClick={async () => {
                  if (category.subCategoryArray.length === 0) {
                    console.log("syncing");
                    await syncCategory(category);
                  } else {
                    setSelectedOptionArray(category.subCategoryArray);
                    props.setUnsavedTree((prev) =>
                      prev
                        ? {
                            ...prev,
                            nameArray: [...prev.nameArray, category.name],
                          }
                        : {
                            ...props.category,
                            nameArray: [category.name],
                          }
                    );
                  }
                }}
                key={i}
                className={
                  "my-1 mr-2 flex aspect-square flex-col items-center justify-center  gap-y-1 hyphens-auto  rounded-lg border border-zinc-400 text-center"
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
                  {category.subCategoryArray.length > 0 &&
                    category.subCategoryArray.length + " subcategories"}
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
