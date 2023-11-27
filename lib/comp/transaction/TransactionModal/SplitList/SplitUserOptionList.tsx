import React from "react";

import { Button } from "@/comp/Button";

import { mergeCategoryArray } from "@/util/category";
import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";

const SplitUserOptionList = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const appGroup = useStore((state) => state.appGroup);
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray,
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );

  return (
    <>
      {appGroup?.userArray
        ? appGroup.userArray.map((user, i) =>
            unsavedSplitArray.find((split) => split.userId === user.id) ||
            user.id === appUser?.id ? null : (
              <div key={i} className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                  <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
                </div>
                <div>{user.id.slice(0, 8)}</div>
                <Button
                  className="bg-zinc-800 text-indigo-300"
                  onClick={() => {
                    if (!transaction) {
                      console.error("no transaction data for modal");
                      return;
                    }

                    if (!appUser) {
                      console.error("no appUser");
                      return;
                    }

                    const mergedCategoryArray =
                      mergeCategoryArray(unsavedSplitArray);

                    const updatedSplitArray = structuredClone(
                      unsavedSplitArray,
                    ).map((split) => ({
                      ...split,
                      categoryArray: split.categoryArray.map((category, i) => ({
                        ...category,
                        amount: parseMoney(
                          //categories are expected to be ordered identically
                          mergedCategoryArray[i].amount /
                            (unsavedSplitArray.length + 1),
                        ),
                      })),
                    }));

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
        : null}
    </>
  );
};

export default SplitUserOptionList;
