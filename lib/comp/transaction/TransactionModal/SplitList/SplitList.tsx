import { Icon } from "@iconify-icon/react";
import React, { useState } from "react";
import { SplitClientSide } from "@/util/types";
import ActionBtn from "@/comp/Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "@/util/trpc";
import { useStoreActions, useStoreState } from "@/util/store";
import SplitUserOptionList from "./SplitUserOptionList";
import H3 from "@/comp/H3";
import Button from "@/comp/Button/Button";

const SplitList = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { appUser, currentTransaction: transaction } = useStoreState(
    (state) => state
  );
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

  const removeSplit = trpc.split.remove.useMutation();
  const queryClient = trpc.useContext();
  const createTransaction = trpc.transaction.create.useMutation();
  const updateSplit = trpc.split.update.useMutation();
  const createSplit = trpc.split.create.useMutation();
  const createCategory = trpc.category.create.useMutation();

  const [unsavedSplitArray, setUnsavedSplitArray] = useState<SplitClientSide[]>(
    transaction ? structuredClone(transaction.splitArray) : []
  );
  const [isManaging, setIsManaging] = useState(false);

  //whenever splitArray changes, push that change to currentTransaction
  const amount = transaction ? transaction.amount : 0;

  const calcSplitTotal = (split: SplitClientSide) => {
    return split.categoryArray.reduce(
      (total, category) => total + category.amount,
      0
    );
  };

  let updatedTotalSplit =
    Math.floor(
      unsavedSplitArray.reduce(
        (amount, split) => amount + calcSplitTotal(split),
        0
      ) * 100
    ) / 100;

  return (
    appUser &&
    transaction && (
      <div className="flex w-full flex-col gap-y-3">
        <div className="flex gap-x-2">
          {props.children}
          {unsavedSplitArray.length === 1 && (
            <ActionBtn onClick={() => setIsManaging(true)}>Split</ActionBtn>
          )}
        </div>

        {unsavedSplitArray.length > 1 && (
          <div className="flex flex-col gap-y-2">
            <div className="flex w-full justify-between">
              <H3>Split</H3>
              {isManaging ? (
                <div className="flex gap-x-2">
                  <ActionBtn
                    onClick={async () => {
                      setIsManaging(false);
                      if (transaction.inDB) {
                        unsavedSplitArray.forEach(async (split) => {
                          if (split.inDB && split.id) {
                            await updateSplit.mutateAsync({
                              split,
                            });
                          } else {
                            createSplit.mutateAsync({ split });
                          }
                        });
                      } else {
                        await createTransaction.mutateAsync({
                          userId: appUser.id,
                          transactionId: transaction.id,
                          splitArray: unsavedSplitArray,
                        });
                      }

                      queryClient.transaction.getTransactionArray.refetch();
                    }}
                  >
                    Save changes
                  </ActionBtn>

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
                  onRemoveUser={() => {
                    const updatedSplitArray =
                      structuredClone(unsavedSplitArray);
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
                    const updatedSplitArray =
                      structuredClone(unsavedSplitArray);
                    updatedSplitArray[i].categoryArray.forEach((category) => {
                      category.amount =
                        amount / updatedSplitArray[i].categoryArray.length;
                    });

                    setUnsavedSplitArray(updatedSplitArray);
                  }}
                  amount={amount}
                  split={split}
                  splitTotal={calcSplitTotal(split)}
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
          {updatedTotalSplit !== amount &&
            unsavedSplitArray.length > 0 &&
            `Split is ${updatedTotalSplit > amount ? "greater " : "less "}
          than the amount (${`updatedTotalSplit $${updatedTotalSplit}`})`}
        </div>

        {isManaging && (
          <SplitUserOptionList
            unsavedSplitArray={unsavedSplitArray}
            setUnsavedSplitArray={setUnsavedSplitArray}
          />
        )}
      </div>
    )
  );
};

export default SplitList;
