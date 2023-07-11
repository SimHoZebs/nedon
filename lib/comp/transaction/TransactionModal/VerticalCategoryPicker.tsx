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

//TODO: Later just make it a className change instead of this massive duplicate
const CategoryPicker = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const categoryArray = trpc.getCategoryArray.useQuery(undefined, {
    staleTime: Infinity,
  });
  const updateTransaction = trpc.transaction.upsertManyCategory.useMutation();
  const createTransaction = trpc.transaction.createTransaction.useMutation();
  const queryClient = trpc.useContext();

  const [categoryTree, setCategoryTree] = useState<string[]>([]);
  const [selectedCategoryArray, setSelectedCategoryArray] = useState<
    HierarchicalCategory[]
  >([]);

  const setCategory = async (categoryWithSub?: HierarchicalCategory) => {
    if (!appUser || !categoryArray.data) return;

    const treeCopy = [...categoryTree];
    if (categoryWithSub) treeCopy.push(categoryWithSub.name);

    const category: CategoryClientSide = {
      amount: props.transaction.amount,
      categoryTree: treeCopy,
      transactionId: props.transaction.transaction_id,
    };

    if (props.transaction.inDB) {
      props.transaction.categoryArray.forEach(async (category) => {
        await updateTransaction.mutateAsync({
          transactionId: props.transaction.transaction_id,
          categoryArray: [{ ...category, id: category.id }],
        });
      });
    } else {
      await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: props.transaction.transaction_id,
        categoryArray: [category],
      });
    }

    setCategoryTree([]);
    setSelectedCategoryArray(categoryArray.data);
    props.setTransaction({
      ...props.transaction,
      categoryArray: [category],
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
          className="absolute left-0 flex max-h-[50vh] w-full sm:w-96 flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 p-2 pb-0 pr-0 text-zinc-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full justify-between pr-1">
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
                  setCategory();
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

          <div className="text-zinc-300 w-full gap-2 overflow-x-hidden overflow-y-scroll bg-zinc-800 pt-1 text-xs auto-rows-max grid">
            {selectedCategoryArray.map((category, i) => (
              <button
                onClick={async () => {
                  if (category.subCategory.length === 0) {
                    await setCategory(category);
                  } else {
                    setSelectedCategoryArray([...category.subCategory]);
                    setCategoryTree((prev) => [...prev, category.name]);
                  }
                }}
                key={i}
                className={
                  "flex w-full items-center hyphens-auto p-3 text-center gap-x-2 border-b-2 border-b-zinc-600 last:border-b-0"
                }
              >
                <Icon
                  className={
                    "text-zinc-800 rounded-full p-1 " +
                    (categoryStyle[category.name]?.bgColor || "bg-zinc-300")
                  }
                  icon={
                    categoryStyle[category.name]?.icon ||
                    "material-symbols:category-outline"
                  }
                  height={24}
                />
                {category.name}
                {category.subCategory.length > 0 && (
                  <Icon icon={"mdi:chevron-right"} width={24} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  ) : null;
};

export default CategoryPicker;
