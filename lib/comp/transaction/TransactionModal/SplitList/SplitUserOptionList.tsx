import React from "react";
import { useStore } from "@/util/store";
import { Icon } from "@iconify-icon/react";
import Button from "@/comp/Button/Button";
import { useTransactionStore } from "@/util/transactionStore";
import { mergeCategoryArray } from "@/util/category";
import parseMoney from "@/util/parseMoney";

const SplitUserOptionList = () => {
  const appUser = useStore((state) => state.appUser);
  const appGroup = useStore((state) => state.appGroup);
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray,
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );

  return (
    appUser &&
    appGroup?.userArray?.map((user, i) =>
      unsavedSplitArray.find((split) => split.userId === user.id) ||
      user.id === appUser.id ? null : (
        <div key={i} className="flex items-center gap-x-2">
          <Icon
            className="rounded-full border-2 border-zinc-400 bg-zinc-800 p-2"
            icon="mdi:account"
            width={20}
          />
          <div>{user.id.slice(0, 8)}</div>
          <Button
            className="bg-zinc-800 text-indigo-300"
            onClick={() => {
              if (!transaction) {
                console.error("no transaction data for modal");
                return;
              }

              const mergedCategoryArray = mergeCategoryArray(unsavedSplitArray);

              const updatedSplitArray = structuredClone(unsavedSplitArray).map(
                (split) => ({
                  ...split,
                  categoryArray: split.categoryArray.map((category, i) => ({
                    ...category,
                    amount: parseMoney(
                      //categories are expected to be ordered identically
                      mergedCategoryArray[i].amount /
                        (unsavedSplitArray.length + 1),
                    ),
                  })),
                }),
              );

              const appUserCategoryArray = updatedSplitArray.find(
                (split) => split.userId === appUser.id,
              )?.categoryArray;

              if (!appUserCategoryArray) {
                console.error("appUser has no category array");
                return;
              }

              updatedSplitArray.push({
                id: null,
                transactionId: null,
                userId: user.id,
                categoryArray: structuredClone(appUserCategoryArray),
              });

              setUnsavedSplitArray(updatedSplitArray);
            }}
          >
            Split
          </Button>
        </div>
      ),
    )
  );
};

export default SplitUserOptionList;
