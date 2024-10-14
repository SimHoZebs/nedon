import type React from "react";

import { ActionBtn, Button } from "@/comp/Button";
import { H3 } from "@/comp/Heading";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import { isUnsavedTxInDB } from "@/types/tx";

import SplitUser from "./SplitUser";
import SplitUserOptionList from "./SplitUserOptionList";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onAmountChange: (index: number, splitAmount: string) => void;
}

const SplitList = (props: Props) => {
  const updateTx = trpc.tx.update.useMutation({
    onSuccess: async () => {
      console.log("updateTx success, invalidating tx.getAll");
      await queryClient.tx.getAll.invalidate();
      console.log("tx.getAll invalidated");
    },
  });
  const deleteSplit = trpc.split.delete.useMutation();
  const queryClient = trpc.useUtils();
  const resetTx = useTxStore((state) => state.resetTx);

  const { appUser } = getAppUser();
  const isEditingSplit = useTxStore((state) => state.isEditingSplit);
  const setIsEditingSplit = useTxStore((state) => state.setIsEditingSplit);
  const tx = useTxStore((state) => state.txOnModal);
  const setCatArray = useTxStore((state) => state.setCatArray);
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

  const splitArray = tx?.splitArray || [];

  const updatedSplitAmount = parseMoney(
    splitArray.reduce((amount, split) => amount + split.amount, 0),
  );

  const isWrongSplit = updatedSplitAmount !== txAmount && splitArray.length > 0;

  const syncSplit = async () => {
    if (!appUser || !tx) {
      console.error("appUser or tx is undefined. appuser:", appUser, "tx:", tx);
      return;
    }

    //delete splits that are not in splitArray
    for (const split of tx.splitArray) {
      if (
        split.id &&
        !splitArray.find((unsavedSplit) => unsavedSplit.id === split.id)
      )
        await deleteSplit.mutateAsync({ splitId: split.id });
    }

    tx.splitArray = splitArray;

    if (!isUnsavedTxInDB(tx)) {
      console.error("Can't update Tx if tx doesn't exist in db", tx);
      return;
    }

    await updateTx.mutateAsync(tx);
  };

  const resetEditingSplit = () => {
    setIsEditingSplit(false);
    setEditedSplitIndexArray([]);
    setFocusedSplitIndex(undefined);
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      {(splitArray.length > 0 || focusedIndex !== undefined) && (
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
                    resetTx();
                    setCatArray(tx.catArray);
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
              updatedSplitAmount !== txAmount && splitArray.length > 0
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
            {splitArray.map((split, i) => (
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

          {focusedIndex !== undefined && splitArray.length > 1 && (
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
