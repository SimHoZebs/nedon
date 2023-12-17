import React from "react";

import { Button } from "@/comp/Button";

import { mergeCatArray } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

const SplitUserOptionList = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const appGroup = trpc.group.get.useQuery(
    { id: appUser?.groupArray?.[0].id || "" },
    { staleTime: Infinity, enabled: !!appUser },
  );

  // const appGroup = useStore((state) => state.appGroup);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );

  return (
    <div className="no-scrollbar flex h-fit w-full flex-col gap-y-2 overflow-y-scroll">
      {appGroup.isFetching
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex w-2/3 animate-pulse rounded-lg bg-zinc-700 p-2 px-1"
            >
              <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
              </div>
            </div>
          ))
        : appGroup.data?.userArray
          ? appGroup.data.userArray.map((user, i) =>
              unsavedSplitArray.find((split) => split.userId === user.id) ||
              user.id === appUser?.id ? null : (
                <div key={i} className="flex items-center gap-x-2 p-2 px-1">
                  <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                    <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
                  </div>
                  <div>{user.id.slice(0, 8)}</div>
                  <Button
                    className="bg-zinc-800 text-indigo-300"
                    onClick={() => {
                      if (!appUser) {
                        console.error("no appUser");
                        return;
                      }

                      const mergedCatArray = mergeCatArray(unsavedSplitArray);

                      const updatedSplitArray = structuredClone(
                        unsavedSplitArray,
                      ).map((split) => ({
                        ...split,
                        catArray: split.catArray.map((cat, i) => ({
                          ...cat,
                          amount: parseMoney(
                            //categories are expected to be ordered identically
                            mergedCatArray[i].amount /
                              (unsavedSplitArray.length + 1),
                          ),
                        })),
                      }));

                      const appUserCatArray = updatedSplitArray.find(
                        (split) => split.userId === appUser.id,
                      )?.catArray;

                      if (!appUserCatArray) {
                        console.error("appUser has no cat array");
                        return;
                      }

                      updatedSplitArray.push({
                        id: undefined,
                        txId: undefined,
                        userId: user.id,
                        catArray: structuredClone(appUserCatArray),
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
    </div>
  );
};

export default SplitUserOptionList;
