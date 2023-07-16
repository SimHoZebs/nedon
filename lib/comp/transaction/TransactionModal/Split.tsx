import { Icon } from "@iconify-icon/react";
import React, { useState } from "react";
import { SplitClientSide } from "../../../util/types";
import ActionBtn from "../../Button/ActionBtn";
import H3 from "../../H3";
import UserSplit from "./UserSplit";
import { trpc } from "../../../util/trpc";
import { useStoreActions, useStoreState } from "../../../util/store";

interface Props {
  categoryTreeId: string;
  splitArray: SplitClientSide[];
}

const Split = (props: Props) => {
  const {
    appUser,
    appGroup,
    currentTransaction: transaction,
  } = useStoreState((state) => state);
  const { setCurrentTransaction: setTransaction } = useStoreActions(
    (actions) => actions
  );

  const removeSplit = trpc.transaction.removeSplit.useMutation();
  const queryClient = trpc.useContext();

  const [unsavedSplitArray, setSplitArr] = useState<SplitClientSide[]>(
    props.splitArray
  );

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
    <div className="flex w-full flex-col gap-y-1">
      <H3>Friends</H3>

      {unsavedSplitArray.length > 1 &&
        unsavedSplitArray.map((split, i) => (
          <div key={i} className="flex w-full items-center gap-x-2 sm:gap-x-3">
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
                      categoryTreeId: props.categoryTreeId,
                      userId: split.userId,
                    });

                    updatedSplitArray.splice(i, 1);

                    if (updatedSplitArray.length === 1) {
                      updatedSplitArray.pop();
                      await removeSplit.mutateAsync({
                        categoryTreeId: props.categoryTreeId,
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
                const updatedSplit: SplitClientSide = {
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
                  className="rounded-full bg-zinc-800 p-2 hover:text-zinc-100"
                  width={28}
                  height={28}
                />
                <p>{split.userId.slice(0, 8)}</p>
              </div>
            </UserSplit>
          </div>
        ))}

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
            <div key={i} className="flex">
              <div>{user.id.slice(0, 8)}</div>
              <ActionBtn
                onClick={() => {
                  const updatedSplitArray = [...unsavedSplitArray];
                  if (!updatedSplitArray.length)
                    updatedSplitArray.push({
                      id: appUser.id,
                      categoryTreeId: props.categoryTreeId,
                      userId: appUser.id,
                      amount,
                    });
                  else {
                    updatedSplitArray.push({
                      id: user.id,
                      categoryTreeId: props.categoryTreeId,
                      userId: user.id,
                      amount: 0,
                    });
                  }

                  setSplitArr(updatedSplitArray);
                }}
              >
                Split
              </ActionBtn>
            </div>
          )
        )}
    </div>
  );
};

export default Split;
