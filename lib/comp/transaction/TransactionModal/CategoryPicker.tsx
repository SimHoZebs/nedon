import React, { useEffect, useState } from "react";
import { trpc } from "../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import { useStoreState } from "../../../util/store";
import {
  CategoryClientSide,
  HierarchicalCategory,
  FullTransaction,
} from "../../../util/types";
import categoryStyle from "../../../util/categoryStyle";

interface Props {
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
  setShowCategoryPicker: React.Dispatch<React.SetStateAction<boolean>>;
  showCategoryPicker: boolean;
}

const CategoryPicker = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const categoryArray = trpc.getCategoryArray.useQuery(undefined, {
    staleTime: Infinity,
  });
  const upsertTransaction = trpc.transaction.upsertManyCategory.useMutation();
  const createTransaction = trpc.transaction.createTransaction.useMutation();
  const queryClient = trpc.useContext();

  const [categoryTree, setCategoryTree] = useState<string[]>([]);
  const [selectedCategoryArray, setSelectedCategoryArray] = useState<
    HierarchicalCategory[]
  >([]);

  const syncCategory = async (hierarchicalCategory?: HierarchicalCategory) => {
    if (!appUser || !categoryArray.data) return;

    const treeCopy = [...categoryTree];
    if (hierarchicalCategory) treeCopy.push(hierarchicalCategory.name);

    const category: CategoryClientSide = {
      amount: props.transaction.amount,
      categoryTree: treeCopy,
      transactionId: props.transaction.transaction_id,
    };

    let updatedCategoryArray: CategoryClientSide[] = [];

    //IMPROVE: picker should understand there can be mroe unsaved category than there is saved. The unsaved categoryArray should be mapped through instead.
    //Picker will update category at a time - there should be a useState that keeps track of that.
    if (props.transaction.inDB) {
      const test = props.transaction.categoryArray.map(async (c) => {
        const transaction = await upsertTransaction.mutateAsync({
          transactionId: props.transaction.transaction_id,
          categoryArray: [{ ...category, id: c.id }],
        });
        return transaction.categoryArray;
      });
      updatedCategoryArray = await test[test.length - 1];
    } else {
      const transaction = await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: props.transaction.transaction_id,
        categoryArray: [category],
      });
      updatedCategoryArray = transaction.categoryArray;
    }

    setCategoryTree([]);

    setSelectedCategoryArray(categoryArray.data);
    props.setTransaction({
      ...props.transaction,
      categoryArray: updatedCategoryArray,
    });

    queryClient.transaction.getTransactionArray.refetch();
    props.setShowCategoryPicker(false);
  };

  useEffect(() => {
    setSelectedCategoryArray(categoryArray.data || []);
  }, [categoryArray.data]);

  return appUser ? (
    <>
      <div className="flex gap-x-2 items-center">
        <button
          className={"" + (categoryTree.length > 0 ? "animate-pulse" : "")}
        >
          {categoryTree.length === 0
            ? props.transaction.categoryArray[0]?.categoryTree.join(" > ")
            : categoryTree.join(" > ")}
        </button>
      </div>
      {categoryArray.data && props.showCategoryPicker && (
        <div
          className="absolute left-0 flex max-h-[50vh] w-full sm:w-96 flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full justify-between px-2 py-1">
            <div className="flex w-fit items-center">
              {categoryArray.data !== selectedCategoryArray && (
                <button
                  className="flex"
                  onClick={() => {
                    setSelectedCategoryArray(categoryArray.data);
                    setCategoryTree([]);
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
                  props.setShowCategoryPicker(false);
                  setCategoryTree([]);
                  setSelectedCategoryArray(categoryArray.data);
                }}
              >
                cancel
              </button>
            </div>
          </div>

          <hr className="w-full border-zinc-700" />

          <div className="pl-2 pb-1 grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 text-xs ">
            {selectedCategoryArray.map((category, i) => (
              <button
                onClick={async () => {
                  if (category.subCategory.length === 0) {
                    await syncCategory(category);
                  } else {
                    setSelectedCategoryArray(category.subCategory);
                    setCategoryTree((prev) => [...prev, category.name]);
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
