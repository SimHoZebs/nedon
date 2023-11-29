import React, { useState } from "react";

import { ActionBtn, Button, SecondaryBtn } from "@/comp/Button";
import { H3 } from "@/comp/Heading";

import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";
import { SplitClientSide, isSplitInDB } from "@/util/types";

import SplitUserOptionList from "./SplitUserOptionList";
import UserSplit from "./UserSplit";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const SplitList = (props: Props) => {
  const createTransaction = trpc.transaction.create.useMutation();
  const deleteSplit = trpc.split.delete.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const upsertManyCategory = trpc.category.upsertMany.useMutation();
  const queryClient = trpc.useUtils();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
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
  const [modifiedSplitIndexArray, setModifiedSplitIndexArray] = useState<
    number[]
  >([]);

  const transactionAmount = transaction?.amount || 0;

  let updatedSplitAmount = parseMoney(
    unsavedSplitArray.reduce(
      (amount, split) => amount + calcSplitAmount(split),
      0,
    ),
  );

  const isWrongSplit =
    updatedSplitAmount !== transactionAmount && unsavedSplitArray.length > 0;

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
    setModifiedSplitIndexArray([]);
    queryClient.transaction.invalidate();
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center gap-x-3">
        {props.children}
        {unsavedSplitArray.length === 1 && !isManaging && (
          <SecondaryBtn onClick={() => setIsManaging(true)}>
            <span className="icon-[lucide--split] m-1 h-4 w-4" />
            Split
          </SecondaryBtn>
        )}
      </div>

      {(unsavedSplitArray.length > 1 || isManaging) && (
        <div className="flex flex-col gap-y-1">
          <div className="flex w-full gap-x-2">
            <H3>Split</H3>
            {isManaging ? (
              <div className="flex gap-x-2">
                <ActionBtn disabled={isWrongSplit} onClickAsync={saveChanges}>
                  Save changes
                </ActionBtn>

                <ActionBtn
                  variant="negative"
                  onClick={() => {
                    setIsManaging(false);
                    setModifiedSplitIndexArray([]);
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
                <span className="icon-[mdi--edit]" />
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
                modifiedSplitIndexArray={modifiedSplitIndexArray}
                setModifiedSplitIndexArray={setModifiedSplitIndexArray}
                index={i}
              >
                <div className="flex items-center gap-x-2 rounded-full border-2 border-zinc-400">
                  <span className="2 icon-[mdi--account] h-8 w-8 bg-zinc-400 hover:bg-zinc-100" />
                </div>
              </UserSplit>
            </div>
          ))}

          <div className="h-5 text-red-800">
            {updatedSplitAmount !== transactionAmount &&
              unsavedSplitArray.length > 0 &&
              `Current split total is $${updatedSplitAmount}; $${parseMoney(
                Math.abs(transactionAmount - updatedSplitAmount),
              )} ${
                updatedSplitAmount > transactionAmount ? "greater " : "less "
              }
          than needed`}
          </div>
        </div>
      )}

      {isManaging && <SplitUserOptionList />}
    </div>
  );
};

export default SplitList;
