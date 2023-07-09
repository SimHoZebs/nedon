import React, { useEffect, useState } from "react";
import { trpc } from "../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import { useStoreState } from "../../../util/store";
import { Category, FullTransaction } from "../../../util/types";

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
  const updateCategory = trpc.transaction.updateCategory.useMutation();
  const createTransaction = trpc.transaction.createTransaction.useMutation();
  const queryClient = trpc.useContext();

  const [categoryTree, setCategoryTree] = useState<string[]>([]);
  const [selectedCategoryArray, setSelectedCategoryArray] = useState<
    Category[]
  >([]);

  const setCategory = async (category?: Category) => {
    if (!appUser || !categoryArray.data) return;

    const newCategoryArray = [...categoryTree];
    category && newCategoryArray.push(category.name);

    props.transaction.inDB
      ? await updateCategory.mutateAsync({
          transactionId: props.transaction.transaction_id,
          categoryArray: newCategoryArray,
        })
      : await createTransaction.mutateAsync({
          userId: appUser.id,
          transactionId: props.transaction.transaction_id,
          categoryArray: newCategoryArray,
        });

    setCategoryTree([]);
    setSelectedCategoryArray(categoryArray.data);
    props.setTransaction({
      ...props.transaction,
      category: newCategoryArray,
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
            ? props.transaction.category?.join(" > ")
            : categoryTree.join(" > ")}
        </button>
      </div>
      {categoryArray.data && props.showCategoryPicker && (
        <div
          className="absolute left-0 flex max-h-[50vh] w-full sm:w-96 flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 p-2 text-zinc-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex w-full justify-between">
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

          <div className="grid w-full auto-cols-fr grid-cols-4 gap-2 overflow-x-hidden overflow-y-scroll bg-zinc-800 py-1 text-xs">
            {selectedCategoryArray.map((category, i) => (
              <button
                onClick={async () => {
                  if (category.subCategory.length === 0) {
                    await setCategory(category);
                  } else {
                    setSelectedCategoryArray(category.subCategory);
                    setCategoryTree((prev) => [...prev, category.name]);
                  }
                }}
                key={i}
                className={
                  "flex aspect-square items-center justify-center hyphens-auto  rounded-lg border  border-zinc-400 p-1 text-center " +
                  (category.subCategory.length > 0 ? "" : "bg-green-700")
                }
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  ) : null;
};

export default CategoryPicker;
