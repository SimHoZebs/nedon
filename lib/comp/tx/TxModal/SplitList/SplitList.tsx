import type React from "react";

import { ActionBtn, Button } from "@/comp/Button";
import { H3 } from "@/comp/Heading";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import SplitUser from "./SplitUser";
import SplitUserOptionList from "./SplitUserOptionList";
import { isUnsavedTxInDB } from "@/types/tx";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onAmountChange: (index: number, splitAmount: string) => void;
}

const SplitList = (props: Props) => {
  const updateTx = trpc.tx.update.useMutation();
  const deleteSplit = trpc.split.delete.useMutation();
  const queryClient = trpc.useUtils();

  const { appUser } = getAppUser();
  const isEditingSplit = useTxStore((state) => state.isEditingSplit);
  const setIsEditingSplit = useTxStore((state) => state.setIsEditingSplit);
  const tx = useTxStore((state) => state.txOnModal);
  const refreshTxModalData = useTxStore((state) => state.refreshTxModalData);
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const setUnsavedCatArray = useTxStore((state) => state.setUnsavedCatArray);
  const splitAmountDisplayArray = useTxStore(
    (state) => state.splitAmountDisplayArray,
  );
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);
  const setFocusedSplitIndex = useTxStore(
    (state) => state.setFocusedSplitIndex,
  );
  const setSplitAmountDisplayArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );
  const setFocusedIndex = useTxStore((state) => state.setFocusedSplitIndex);
  const editedSplitIndexArray = useTxStore(
    (state) => state.editedSplitIndexArray,
  );
  const setEditedSplitIndexArray = useTxStore(
    (state) => state.setEditedSplitIndexArray,
  );

  const txAmount = tx?.amount || 0;

  const updatedSplitAmount = parseMoney(
    unsavedSplitArray.reduce((amount, split) => amount + split.amount, 0),
  );

  const isWrongSplit =
    updatedSplitAmount !== txAmount && unsavedSplitArray.length > 0;

  const syncSplit = async () => {
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

    tx.splitArray = unsavedSplitArray;

    if (!isUnsavedTxInDB(tx)) {
      console.error("Can't update Tx if tx doesn't exist in db", tx);
      return;
    }

    const txDBData = await updateTx.mutateAsync(tx);

    refreshTxModalData(txDBData);
    queryClient.tx.invalidate();
  };

  const resetEditingSplit = () => {
    setIsEditingSplit(false);
    setEditedSplitIndexArray([]);
    setFocusedSplitIndex(undefined);
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      {(unsavedSplitArray.length > 0 || focusedIndex !== undefined) && (
        <div className="flex flex-col gap-y-1">
          <div className="flex w-full gap-x-2 px-3">
            <H3>Split</H3>

            {isEditingSplit ? (
              <div className="flex gap-x-2">
                <ActionBtn
                  disabled={isWrongSplit}
                  onClickAsync={async () => {
                    await syncSplit();
                    resetEditingSplit();
                  }}
                >
                  Save changes
                </ActionBtn>

                <ActionBtn
                  variant="negative"
                  onClick={() => {
                    resetEditingSplit();
                    if (!tx) {
                      console.error("Can't reset splitArray. tx is undefined");
                      return;
                    }
                    setUnsavedSplitArray(tx.splitArray);
                    setUnsavedCatArray(tx.catArray);
                    const splitAmountArray = tx.splitArray.map((split) =>
                      split.amount.toString(),
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
                onClick={() => setIsEditingSplit(true)}
              >
                <span className="icon-[mdi--edit]" />
                Manage
              </Button>
            )}
          </div>

          <p
            className={`h-5 text-red-800 ${
              updatedSplitAmount !== txAmount && unsavedSplitArray.length > 0
                ? ""
                : "hidden"
            }`}
          >
            {`Current split total is $${updatedSplitAmount}; ${parseMoney(
              Math.abs(txAmount - updatedSplitAmount),
            )} ${updatedSplitAmount > txAmount ? "over " : "under "}
          the total`}
          </p>

          <div className="flex flex-col gap-y-1 px-3 md:w-fit">
            {unsavedSplitArray.map((split, i) => (
              <div
                key={split.id}
                className="flex w-full items-center gap-x-2 sm:gap-x-3"
              >
                <SplitUser
                  onAmountChange={(updatedAmount) => {
                    setEditedSplitIndexArray((prev) => [...prev, i]);
                    props.onAmountChange(i, updatedAmount);
                  }}
                  splitAmount={splitAmountDisplayArray[i]}
                  editedIndexArray={editedSplitIndexArray}
                  onFocus={() => {
                    setFocusedIndex(i);
                    setIsEditingSplit(true);
                  }}
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
