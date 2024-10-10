import React from "react";

import { Button } from "@/comp/Button";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { useTxStore } from "@/util/txStore";

import type { SplitClientSide } from "@/types/split";

const SplitUserOptionList = () => {
  const { appUser } = getAppUser();

  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const unsavedCatArray = useTxStore((state) => state.unsavedCatArray);
  const setUnsavedCatArray = useTxStore((state) => state.setUnsavedCatArray);
  const setIsEditingSplit = useTxStore((state) => state.setIsEditingSplit);
  const txOnModal = useTxStore((state) => state.txOnModal);

  return (
    <div className="no-scrollbar flex h-fit w-full flex-col gap-y-2 overflow-y-scroll">
      {!appUser
        ? Array.from({ length: 3 }).map((_, i) => (
            <div
              // biome-ignore lint: just a loading bar
              key={i}
              className="flex w-2/3 animate-pulse rounded-lg bg-zinc-700 p-2 px-1"
            >
              <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
              </div>
            </div>
          ))
        : appUser.myConnectionArray
          ? appUser.myConnectionArray.map((user) =>
              unsavedSplitArray.find((split) => split.userId === user.id) ||
              user.id === appUser?.id ? null : (
                <div
                  key={user.id}
                  className="flex items-center gap-x-2 p-2 px-1"
                >
                  <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                    <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
                  </div>
                  <div>{user.name}</div>
                  <Button
                    className="bg-zinc-800 text-indigo-300"
                    onClick={() => {
                      if (!appUser) {
                        console.error("no appUser");
                        return;
                      }

                      if (!txOnModal) {
                        console.error("no txOnModal");
                        return;
                      }

                      //evenly reduce amount from all splits to assign to new
                      //split
                      const updatedSplitArray: SplitClientSide[] =
                        structuredClone(unsavedSplitArray).map((split) => ({
                          ...split,
                          //1 for new split
                          amount: parseMoney(
                            txOnModal.amount / (unsavedSplitArray.length + 1),
                          ),
                        }));

                      //reduce for tx.user as well
                      const updatedCatArray = structuredClone(
                        unsavedCatArray,
                      ).map((cat) => ({
                        ...cat,
                        amount: parseMoney(
                          txOnModal.amount / (unsavedSplitArray.length + 1),
                        ),
                      }));

                      //add new split
                      updatedSplitArray.push({
                        id: undefined,
                        txId: null,
                        originTxId: undefined,
                        amount: parseMoney(
                          txOnModal.amount / (unsavedSplitArray.length + 1),
                        ),
                        userId: user.id,
                      });

                      setUnsavedSplitArray(updatedSplitArray);
                      setUnsavedCatArray(updatedCatArray);
                      setIsEditingSplit(true);
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
