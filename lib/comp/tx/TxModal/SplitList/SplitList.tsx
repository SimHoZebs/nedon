import { ActionBtn, Button } from "@/comp/shared/Button";
import { H3 } from "@/comp/shared/Heading";

import { trpc } from "@/util/trpc";

import { isTx } from "@/types/tx";

import SplitUser from "./SplitUser";
import SplitUserOptionList from "./SplitUserOptionList";

import { Prisma } from "@prisma/client";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useTxStore } from "lib/store/txStore";
import type React from "react";

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
  const queryClient = trpc.useUtils();
  const revertToTxInDB = useTxStore((state) => state.revertToTxInDB);

  const appUser = useAutoLoadUser();
  const isEditingSplitTx = useTxStore((state) => state.isEditingSplitTx);
  const setIsEditingSplitTx = useTxStore((state) => state.setIsEditingSplitTx);
  const tx = useTxStore((state) => state.txOnModal);
  const setCatArray = useTxStore((state) => state.setCatArray);
  const splitTxAmountDisplayArray = useTxStore(
    (state) => state.splitTxAmountDisplayArray,
  );
  const focusedSplitTxIndex = useTxStore((state) => state.focusedSplitTxIndex);
  const setFocusedSplitTxIndex = useTxStore(
    (state) => state.setFocusedSplitTxIndex,
  );
  const setSplitTxAmountDisplayArray = useTxStore(
    (state) => state.setSplitTxAmountDisplayArray,
  );
  const editedSplitTxIndexArray = useTxStore(
    (state) => state.editedSplitTxIndexArray,
  );
  const setEditedSplitTxIndexArray = useTxStore(
    (state) => state.setEditedSplitTxIndexArray,
  );

  const txAmount = tx?.amount || new Prisma.Decimal(0);

  const splitTxArray = tx?.splitTxArray || [];

  const updatedSplitAmount = splitTxArray.reduce(
    (amount, split) => amount.add(split.amount),
    new Prisma.Decimal(0),
  );

  const isWrongSplit =
    !updatedSplitAmount.equals(txAmount) && splitTxArray.length > 0;

  const syncSplit = async () => {
    if (!appUser || !tx) {
      console.error("appUser or tx is undefined. appuser:", appUser, "tx:", tx);
      return;
    }

    //delete splits that are not in splitTxArray
    for (const split of tx.splitTxArray) {
      if (
        split.id &&
        !splitTxArray.find((unsavedSplit) => unsavedSplit.id === split.id)
      )
        console.log("delete split", split.id);
    }

    tx.splitTxArray = splitTxArray;

    if (!isTx(tx)) {
      console.error("Can't update Tx if tx doesn't exist in db", tx);
      return;
    }

    await updateTx.mutateAsync(tx);
  };

  const resetEditingSplit = () => {
    setIsEditingSplitTx(false);
    setEditedSplitTxIndexArray([]);
    setFocusedSplitTxIndex(undefined);
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      {(splitTxArray.length > 0 || focusedSplitTxIndex !== undefined) && (
        <div className="flex flex-col gap-y-1">
          <div className="flex w-full gap-x-2 px-3">
            <H3>Split</H3>

            {isEditingSplitTx ? (
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
                      console.error(
                        "Can't reset splitTxArray. tx is undefined",
                      );
                      return;
                    }
                    revertToTxInDB();
                    setCatArray(tx.catArray);
                    const splitAmountArray = tx.splitTxArray.map((split) =>
                      split.amount.toNumber().toString(),
                    );
                    setSplitTxAmountDisplayArray(splitAmountArray);
                  }}
                >
                  Cancel
                </ActionBtn>
              </div>
            ) : (
              <Button
                className="flex gap-x-2 rounded-lg bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
                onClick={() => setIsEditingSplitTx(true)}
              >
                <span className="icon-[mdi--edit]" />
                Manage
              </Button>
            )}
          </div>

          <p
            className={`h-5 text-red-800 ${
              !updatedSplitAmount.equals(txAmount) && splitTxArray.length > 0
                ? ""
                : "hidden"
            }`}
          >
            {`Current split total is $${updatedSplitAmount.toString()}; ${txAmount
              .sub(updatedSplitAmount)
              .abs()
              .toString()} ${
              updatedSplitAmount.greaterThan(txAmount) ? "over " : "under "
            }the total`}
          </p>

          <div className="flex flex-col gap-y-1 px-3 md:w-fit">
            {splitTxArray.map((split, i) => (
              <div
                key={split.id}
                className="flex w-full items-center gap-x-2 sm:gap-x-3"
              >
                <SplitUser
                  onAmountChange={(updatedAmount) => {
                    setEditedSplitTxIndexArray((prev) => [...prev, i]);
                    props.onAmountChange(i, updatedAmount);
                  }}
                  splitAmount={splitTxAmountDisplayArray[i]}
                  editedIndexArray={editedSplitTxIndexArray}
                  onFocus={() => {
                    setFocusedSplitTxIndex(i);
                    setIsEditingSplitTx(true);
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

          {focusedSplitTxIndex !== undefined && splitTxArray.length > 1 && (
            <div className="flex items-center gap-x-4 px-2">
              <Button className="rounded-lg px-3 text-xs text-zinc-400 outline-1 outline-zinc-700 hover:bg-zinc-700 hover:text-zinc-300">
                split evenly
              </Button>
              <Button className="rounded-lg px-3 text-xs text-zinc-400 outline-1 outline-zinc-700 hover:bg-zinc-700 hover:text-zinc-300">
                Remove all
              </Button>
            </div>
          )}
        </div>
      )}

      {focusedSplitTxIndex !== undefined && <SplitUserOptionList />}
    </div>
  );
};

export default SplitList;
