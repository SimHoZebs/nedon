import { Icon } from "@iconify-icon/react";
import React, { useState } from "react";
import { SplitClientSide } from "../../../util/types";
import ActionBtn from "../../Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "../../../util/trpc";
import { useStoreActions, useStoreState } from "../../../util/store";
import Button from "../../Button/Button";

type mergedSplit = Omit<SplitClientSide, "categoryTreeId">;

const Split = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const {
    appUser,
    appGroup,
    currentTransaction: transaction,
  } = useStoreState((state) => state);
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

  const removeSplit = trpc.split.remove.useMutation();
  const queryClient = trpc.useContext();

  const [unsavedSplitArray, setSplitArr] = useState<mergedSplit[]>(() => {
    if (!transaction) return [];

    const mergedSplitArray: mergedSplit[] = [];

    transaction.categoryTreeArray.forEach((tree) => {
      tree.splitArray.forEach((split) => {
        const storedSplit = mergedSplitArray.find(
          (storedSplit) => storedSplit.id === split.id
        );
        if (storedSplit) {
          storedSplit.amount += split.amount;
        } else {
          mergedSplitArray.push(structuredClone(split));
        }
      });
    });

    return mergedSplitArray;
  });

  const amount = transaction ? transaction.amount : 0;

  let updatedTotalSplit =
    unsavedSplitArray.length > 1
      ? Math.floor(
          unsavedSplitArray.reduce(
            (amount, split) => amount + split.amount,
            0
          ) * 100
        ) / 100
      : -1;

  return (
    transaction && (
      <div className="flex w-full flex-col gap-y-2">
        <div className="flex gap-x-2">
          {props.children}
          <ActionBtn>Split</ActionBtn>
        </div>

        <div className="flex flex-col gap-y-2">
          {unsavedSplitArray.length > 1 &&
            unsavedSplitArray.map((split, i) => (
              <div
                key={i}
                className="flex w-full items-center gap-x-2 sm:gap-x-3"
              >
                {appUser &&
                  (split.userId === appUser.id ? (
                    <div className="aspect-square w-5"></div>
                  ) : (
                    <button
                      title="Remove user from split"
                      className="group flex w-5"
                      onClick={async () => {
                        if (!split.id) {
                          console.log("split id does not exist:", split.id);
                          return;
                        }

                        const updatedSplitArray = [...unsavedSplitArray];
                        await removeSplit.mutateAsync({
                          transactionId: split.transactionId,
                          userId: split.userId,
                        });

                        updatedSplitArray.splice(i, 1);

                        if (updatedSplitArray.length === 1) {
                          updatedSplitArray.pop();
                          await removeSplit.mutateAsync({
                            transactionId: split.transactionId,
                            userId: appUser.id,
                          });
                        }

                        queryClient.transaction.getTransactionArray.refetch();

                        setSplitArr(updatedSplitArray);
                        console.log("updatedSplitArray:", updatedSplitArray);
                        setTransaction((prev) => structuredClone(transaction));
                      }}
                    >
                      <Icon
                        icon="clarity:remove-line"
                        className="text-zinc-500 group-hover:text-pink-400"
                        width={20}
                        height={20}
                      />
                    </button>
                  ))}

                {updatedTotalSplit !== amount ? (
                  <button
                    className="flex aspect-square min-h-[20px]"
                    onClick={() => {
                      const updatedSplitArray = [...unsavedSplitArray];
                      let newSplitAmount =
                        Math.floor(
                          (split.amount - updatedTotalSplit + amount) * 100
                        ) / 100;

                      if (newSplitAmount < 0) newSplitAmount = 0;

                      updatedSplitArray[i].amount = newSplitAmount;
                      setSplitArr(updatedSplitArray);
                    }}
                  >
                    <Icon
                      className="text-blue-300"
                      icon="cil:balance-scale"
                      width={20}
                    />
                  </button>
                ) : null}

                <UserSplit
                  onAmountChange={(amount: number) => {
                    const updatedSplit: mergedSplit = {
                      ...split,
                      amount,
                    };
                    const updatedSplitArray = [...unsavedSplitArray];
                    updatedSplitArray[i] = updatedSplit;
                    setSplitArr(updatedSplitArray);
                  }}
                  amount={amount}
                  split={split}
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

        <div className="h-5 text-red-800">
          {updatedTotalSplit !== amount &&
            unsavedSplitArray.length > 0 &&
            `Split is ${updatedTotalSplit > amount ? "greater " : "less "}
          than the amount (${`props.totalSplit $${updatedTotalSplit}`})`}
        </div>

        {appUser &&
          appGroup?.userArray &&
          appGroup.userArray.map((user, i) =>
            //Don't show users that are already splitting
            unsavedSplitArray.find((split) => split.userId === user.id) ||
            user.id === appUser.id ? null : (
              <div key={i} className="flex items-center gap-x-2">
                <Icon
                  className="rounded-full border-2 border-zinc-400 bg-zinc-800 p-2"
                  icon="mdi:account"
                  width={20}
                />
                <div>{user.id.slice(0, 8)}</div>
                <Button
                  className="bg-zinc-800 text-indigo-300"
                  onClick={() => {
                    const updatedSplitArray = [...unsavedSplitArray];

                    if (!updatedSplitArray.length)
                      updatedSplitArray.push({
                        id: appUser.id,
                        transactionId: transaction.transaction_id,
                        userId: appUser.id,
                        amount,
                      });

                    updatedSplitArray.push({
                      id: user.id,
                      transactionId: transaction.transaction_id,
                      userId: user.id,
                      amount: 0,
                    });

                    setSplitArr(updatedSplitArray);
                  }}
                >
                  Split
                </Button>
              </div>
            )
          )}
      </div>
    )
  );
};

export default Split;
