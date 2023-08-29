import { Icon } from "@iconify-icon/react";
import React, { useState } from "react";
import { SplitClientSide, isSplitInDB } from "@/util/types";
import ActionBtn from "@/comp/Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "@/util/trpc";
import { useStore } from "@/util/store";
import SplitUserOptionList from "./SplitUserOptionList";
import H3 from "@/comp/H3";
import Button from "@/comp/Button/Button";
import { useTransactionStore } from "@/util/transactionStore";
import { calcSplitAmount } from "@/util/split";
import SecondaryBtn from "@/comp/Button/SecondaryBtn";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const SplitList = (props: Props) => {
  const createTransaction = trpc.transaction.create.useMutation();
  const deleteSplit = trpc.split.delete.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();
  const queryClient = trpc.useContext();

  const appUser = useStore((state) => state.appUser);
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const refreshDBData = useTransactionStore((state) => state.refreshDBData);
  const unsavedSplitArray = useTransactionStore(
    (state) => state.unsavedSplitArray,
  );
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );
  const [isManaging, setIsManaging] = useState(false);
  useState<SplitClientSide[]>();

  const transactionAmount = transaction ? transaction.amount : 0;

  let updatedSplitAmount = parseFloat(
    unsavedSplitArray
      .reduce((amount, split) => amount + calcSplitAmount(split), 0)
      .toFixed(2),
  );

  const saveChanges = async () => {
    if (!appUser || !transaction) {
      console.error(
        "appUser or transaction is undefined. appuser:",
        appUser,
        "transaction:",
        transaction,
      );
      return;
    }

    const splitToDeleteArray = transaction.splitArray.filter(
      (split) =>
        !unsavedSplitArray.find((unsavedSplit) => unsavedSplit.id === split.id),
    );

    splitToDeleteArray.forEach(async (split) => {
      if (split.id) await deleteSplit.mutateAsync({ splitId: split.id });
    });

    if (!transaction.id) {
      const transactionDBData = await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: transaction.transaction_id,
        splitArray: unsavedSplitArray,
      });

      refreshDBData(transactionDBData);
    } else {
      const dbUpdatedSplitArray = await Promise.all(
        unsavedSplitArray.map(async (split) => {
          if (!isSplitInDB(split)) {
            return await createSplit.mutateAsync({
              //id boolean was checked in if statement
              transactionId: transaction.id!,
              split,
            });
          } else {
            return await upsertManyCategory.mutateAsync({
              categoryArray: split.categoryArray,
            });
          }
        }),
      );

      refreshDBData(dbUpdatedSplitArray);
    }

    setIsManaging(false);
    queryClient.transaction.invalidate();
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center gap-x-2">
        {props.children}
        {unsavedSplitArray.length === 1 && !isManaging && (
          <SecondaryBtn onClick={() => setIsManaging(true)}>
            <Icon icon="lucide:split" className="m-1" width={16} height={16} />
            Split
          </SecondaryBtn>
        )}
      </div>

      {(unsavedSplitArray.length > 1 || isManaging) && (
        <div className="flex flex-col gap-y-2">
          <div className="flex w-full gap-x-2">
            <H3>Split</H3>
            {isManaging ? (
              <div className="flex gap-x-2">
                <ActionBtn onClick={saveChanges}>Save changes</ActionBtn>

                <ActionBtn
                  variant="negative"
                  onClick={() => {
                    setIsManaging(false);
                    if (!transaction) {
                      console.error(
                        "Can't reset splitArray. transaction is undefined",
                      );
                      return;
                    }
                    setUnsavedSplitArray(transaction.splitArray);
                  }}
                >
                  Cancel
                </ActionBtn>
              </div>
            ) : (
              <Button
                className="flex gap-x-2 rounded-lg bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
                onClick={() => setIsManaging(true)}
              >
                <Icon icon={"mdi:edit"} />
                Manage
              </Button>
            )}
          </div>

          {unsavedSplitArray.map((split, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-x-2 sm:gap-x-3"
            >
              <UserSplit
                setIsManaging={setIsManaging}
                isManaging={isManaging}
                index={i}
              >
                <div className="flex items-center gap-x-2">
                  <Icon
                    icon="mdi:account"
                    className="rounded-full border-2 border-zinc-400 bg-zinc-800 p-2 hover:text-zinc-100"
                    width={20}
                    height={20}
                  />
                </div>
              </UserSplit>
            </div>
          ))}
        </div>
      )}

      <div className="h-5 text-red-800">
        {updatedSplitAmount !== transactionAmount &&
          unsavedSplitArray.length > 0 &&
          `Split is ${
            updatedSplitAmount > transactionAmount ? "greater " : "less "
          }
          than the amount (${`updatedTotalSplit $${updatedSplitAmount}`})`}
      </div>

      {isManaging && <SplitUserOptionList />}
    </div>
  );
};

export default SplitList;
