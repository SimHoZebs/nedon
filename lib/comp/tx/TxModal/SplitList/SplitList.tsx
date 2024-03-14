import type React from "react";
import { useState } from "react";

import { ActionBtn, Button, SecondaryBtn } from "@/comp/Button";
import { H3 } from "@/comp/Heading";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { isSplitInDB } from "@/util/types";

import SplitUser from "./SplitUser";
import SplitUserOptionList from "./SplitUserOptionList";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onAmountChange: (index: number, splitAmount: string) => void;
}

const SplitList = (props: Props) => {
  const createTx = trpc.tx.create.useMutation();
  const deleteSplit = trpc.split.delete.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManyCat = trpc.cat.upsertMany.useMutation();
  const queryClient = trpc.useUtils();

  const { appUser } = getAppUser();
  const tx = useTxStore((state) => state.txOnModal);
  const refreshDBData = useTxStore((state) => state.refreshDBData);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const amountDisplayArray = useTxStore(
    (state) => state.splitAmountDisplayArray,
  );
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);
  const setFocusedSplitIndex = useTxStore(
    (state) => state.setFocusedSplitIndex,
  );
  const setSplitAmountDisplayArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );

  const [editedIndexArray, setEditedIndexArray] = useState<number[]>([]);

  const txAmount = tx?.amount || 0;

  const updatedSplitAmount = parseMoney(
    unsavedSplitArray.reduce(
      (amount, split) => amount + calcSplitAmount(split),
      0,
    ),
  );

  const isWrongSplit =
    updatedSplitAmount !== txAmount && unsavedSplitArray.length > 0;

  const saveChanges = async () => {
    if (!appUser || !tx) {
      console.error("appUser or tx is undefined. appuser:", appUser, "tx:", tx);
      return;
    }

    //delete splits that are not in unsavedSplitArray
    for (const split of tx.splitArray) {
      if (
        split.id &&
        !unsavedSplitArray.find((unsavedSplit) => unsavedSplit.id === split.id)
      )
        await deleteSplit.mutateAsync({ splitId: split.id });
    }

    //if tx doesn't exist, create one
    if (!tx.id) {
      const txDBData = await createTx.mutateAsync({
        userId: appUser.id,
        txId: tx.transaction_id,
        splitArray: unsavedSplitArray,
      });

      refreshDBData(txDBData);
    }
    //otherwise, update the tx
    else {
      const dbUpdatedSplitArray = await Promise.all(
        unsavedSplitArray.map(async (split) => {
          if (!isSplitInDB(split)) {
            return await createSplit.mutateAsync({
              //biome-ignore lint: id boolean was checked in if statement
              txId: tx.id!,
              split,
            });
          }
          return await upsertManyCat.mutateAsync({
            catArray: split.catArray,
          });
        }),
      );

      refreshDBData(dbUpdatedSplitArray);
    }

    setEditedIndexArray([]);
    queryClient.tx.invalidate();
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center gap-x-3">
        {props.children}
        {unsavedSplitArray.length === 1 && focusedIndex === undefined && (
          <SecondaryBtn onClick={() => setFocusedSplitIndex(0)}>
            <span className="icon-[lucide--split] m-1 h-4 w-4" />
            Split
          </SecondaryBtn>
        )}
      </div>

      {(unsavedSplitArray.length > 1 || focusedIndex !== undefined) && (
        <div className="flex flex-col gap-y-1">
          <div className="flex w-full gap-x-2 px-3">
            <H3>Split</H3>
            {focusedIndex !== undefined ? (
              <div className="flex gap-x-2">
                <ActionBtn disabled={isWrongSplit} onClickAsync={saveChanges}>
                  Save changes
                </ActionBtn>

                <ActionBtn
                  variant="negative"
                  onClick={() => {
                    setEditedIndexArray([]);
                    setFocusedSplitIndex(undefined);
                    if (!tx) {
                      console.error("Can't reset splitArray. tx is undefined");
                      return;
                    }
                    setUnsavedSplitArray(tx.splitArray);
                    const splitAmountArray = tx.splitArray.map((split) =>
                      calcSplitAmount(split).toString(),
                    );
                    setSplitAmountDisplayArray(splitAmountArray);
                  }}
                >
                  Cancel
                </ActionBtn>
              </div>
            ) : (
              <Button
                className="flex gap-x-2 rounded-lg bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
                onClick={() => setFocusedSplitIndex(0)}
              >
                <span className="icon-[mdi--edit]" />
                Manage
              </Button>
            )}
          </div>

          <p
            className={`h-5 ${
              updatedSplitAmount !== txAmount && unsavedSplitArray.length > 0
                ? "text-red-800"
                : "text-transparent"
            }`}
          >
            {`Current split total is $${updatedSplitAmount.toFixed(
              2,
            )}; ${parseMoney(Math.abs(txAmount - updatedSplitAmount)).toFixed(
              2,
            )} ${updatedSplitAmount > txAmount ? "greater " : "less "}
          than needed`}
          </p>

          <div className="flex flex-col gap-y-1 px-3 md:w-fit">
            {unsavedSplitArray.map((split, i) => (
              <div
                key={split.id}
                className="flex w-full items-center gap-x-2 sm:gap-x-3"
              >
                <SplitUser
                  onAmountChange={(updatedAmount) => {
                    setEditedIndexArray((prev) => [...prev, i]);
                    props.onAmountChange(i, updatedAmount);
                  }}
                  splitAmount={amountDisplayArray[i]}
                  editedIndexArray={editedIndexArray}
                  setEditedIndexArray={setEditedIndexArray}
                  index={i}
                >
                  <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                    <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
                  </div>
                </SplitUser>
              </div>
            ))}
          </div>

          {focusedIndex !== undefined && unsavedSplitArray.length > 1 && (
            <div className="flex items-center gap-x-4 px-2">
              <Button className="rounded-lg px-3 text-xs text-zinc-400 outline outline-1 outline-zinc-700 hover:bg-zinc-700 hover:text-zinc-300">
                split evenly
              </Button>
              <Button className="rounded-lg px-3 text-xs text-zinc-400 outline outline-1 outline-zinc-700 hover:bg-zinc-700 hover:text-zinc-300">
                Remove all
              </Button>
            </div>
          )}
        </div>
      )}

      {focusedIndex !== undefined && <SplitUserOptionList />}
    </div>
  );
};

export default SplitList;
