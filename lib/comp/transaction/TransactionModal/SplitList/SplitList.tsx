import { Icon } from "@iconify-icon/react";
import React, { useEffect, useState } from "react";
import { SplitClientSide, isSplitInDB } from "@/util/types";
import ActionBtn from "@/comp/Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "@/util/trpc";
import { useStore } from "@/util/store";
import SplitUserOptionList from "./SplitUserOptionList";
import H3 from "@/comp/H3";
import Button from "@/comp/Button/Button";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const SplitList = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const transaction = useStore((state) => state.transactionOnModal);

  const deleteSplit = trpc.split.delete.useMutation();
  const queryClient = trpc.useContext();
  const createTransaction = trpc.transaction.create.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();

  const unsavedSplitArray = useStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useStore((state) => state.setUnsavedSplitArray);
  const [isManaging, setIsManaging] = useState(false);
  useState<SplitClientSide[]>();

  const transactionAmount = transaction ? transaction.amount : 0;

  const calcSplitAmount = (split: SplitClientSide) => {
    return split.categoryArray.reduce(
      (total, category) => total + category.amount,
      0
    );
  };

  let updatedSplitAmount = parseFloat(
    unsavedSplitArray
      .reduce((amount, split) => amount + calcSplitAmount(split), 0)
      .toFixed(2)
  );

  const saveChanges = async () => {
    if (!appUser || !transaction) {
      console.error(
        "appUser or transaction is undefined. Appuser:",
        appUser,
        "transaction:",
        transaction
      );
      return;
    }

    const splitToDeleteArray = transaction.splitArray.filter(
      (split) =>
        !unsavedSplitArray.find((unsavedSplit) => unsavedSplit.id === split.id)
    );

    splitToDeleteArray.forEach(async (split) => {
      if (split.id) await deleteSplit.mutateAsync({ splitId: split.id });
    });

    if (!transaction.id) {
      await createTransaction.mutateAsync({
        userId: appUser.id,
        transactionId: transaction.transaction_id,
        splitArray: unsavedSplitArray,
      });
    } else {
      unsavedSplitArray.forEach(async (split) => {
        if (!isSplitInDB(split)) {
          await createSplit.mutateAsync({
            //id boolean was checked in if statement
            transactionId: transaction.id!,
            split,
          });
        } else {
          await upsertManyCategory.mutateAsync({
            categoryArray: split.categoryArray,
          });
        }
      });
    }

    setIsManaging(false);
    await queryClient.transaction.getWithoutPlaid.refetch();
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex gap-x-2">
        {props.children}
        {unsavedSplitArray.length === 1 && !isManaging && (
          <ActionBtn onClick={() => setIsManaging(true)}>Split</ActionBtn>
        )}
      </div>

      {(unsavedSplitArray.length > 1 || isManaging) && (
        <div className="flex flex-col gap-y-2">
          <div className="flex w-full justify-between">
            <H3>Split</H3>
            {isManaging ? (
              <div className="flex gap-x-2">
                <ActionBtn onClick={saveChanges}>Save changes</ActionBtn>

                <ActionBtn
                  variant="negative"
                  onClick={() => setIsManaging(false)}
                >
                  Cancel
                </ActionBtn>
              </div>
            ) : (
              <Button
                className="flex gap-x-2 bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
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
                isManaging={isManaging}
                onRemoveUser={() => {
                  const updatedSplitArray = structuredClone(unsavedSplitArray);
                  const splicedSplit = updatedSplitArray.splice(i, 1);
                  const amount = splicedSplit[0].categoryArray.reduce(
                    (total, category) => total + category.amount,
                    0
                  );

                  updatedSplitArray.forEach((split) => {
                    split.categoryArray.forEach((category) => {
                      category.amount += amount / updatedSplitArray.length;
                    });
                  });

                  setUnsavedSplitArray(updatedSplitArray);
                }}
                onAmountChange={(amount: number) => {
                  const updatedSplitArray = structuredClone(unsavedSplitArray);
                  updatedSplitArray[i].categoryArray.forEach((category) => {
                    category.amount =
                      amount / updatedSplitArray[i].categoryArray.length;
                  });

                  setUnsavedSplitArray(updatedSplitArray);
                }}
                transactionAmount={transactionAmount}
                split={split}
                splitAmount={calcSplitAmount(split)}
                userId={split.userId}
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
