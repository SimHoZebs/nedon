import { Icon } from "@iconify-icon/react";
import React, { useEffect, useState } from "react";
import { SplitClientSide } from "../../../util/types";
import ActionBtn from "../../Button/ActionBtn";
import UserSplit from "./UserSplit";
import { trpc } from "../../../util/trpc";
import { useStoreActions, useStoreState } from "../../../util/store";
import SplitUserList from "./SplitUserList";

const Split = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { appUser, currentTransaction: transaction } = useStoreState(
    (state) => state
  );
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

  const removeSplit = trpc.split.remove.useMutation();
  const queryClient = trpc.useContext();

  const [unsavedSplitArray, setUnsavedSplitArray] = useState<SplitClientSide[]>(
    transaction?.splitArray || []
  );

  useEffect(() => {
    console.log("lol");
    const clone = structuredClone(transaction);
    return;

    setTransaction((prev) => structuredClone(transaction));
  }, [unsavedSplitArray]);

  const amount = transaction ? transaction.amount : 0;

  const calcSplitTotal = (split: SplitClientSide) => {
    return split.categoryTreeArray.reduce(
      (total, tree) => total + tree.amount,
      0
    );
  };

  let updatedTotalSplit =
    unsavedSplitArray.length > 1
      ? Math.floor(
          unsavedSplitArray.reduce(
            (amount, split) => amount + calcSplitTotal(split),
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

                        setUnsavedSplitArray(updatedSplitArray);
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

                <UserSplit
                  onAmountChange={(amount: number) => {
                    const updatedSplit: SplitClientSide = {
                      ...split,
                    };
                    const updatedSplitArray = [...unsavedSplitArray];
                    updatedSplitArray[i] = updatedSplit;
                    setUnsavedSplitArray(updatedSplitArray);
                  }}
                  amount={amount}
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

        <div className="h-5 text-red-800">
          {updatedTotalSplit !== amount &&
            unsavedSplitArray.length > 0 &&
            `Split is ${updatedTotalSplit > amount ? "greater " : "less "}
          than the amount (${`props.totalSplit $${updatedTotalSplit}`})`}
        </div>

        <SplitUserList
          unsavedSplitArray={unsavedSplitArray}
          setUnsavedSplitArray={setUnsavedSplitArray}
        />
      </div>
    )
  );
};

export default Split;
