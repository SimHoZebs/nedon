import React, { useState } from "react";
import Modal from "../../Modal";
import {
  CategoryClientSide,
  FullTransaction,
  SplitClientSide,
} from "../../../util/types";
import UserSplit from "./UserSplit";
import { useStoreState } from "../../../util/store";
import { trpc } from "../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import ActionBtn from "../../Button/ActionBtn";
import Category from "./Category";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: FullTransaction;
  setTransaction: React.Dispatch<
    React.SetStateAction<FullTransaction | undefined>
  >;
}

const TransactionModal = (props: Props) => {
  const { appUser, appGroup } = useStoreState((state) => state);
  const createTransaction = trpc.transaction.createTransaction.useMutation();
  const updateSplit = trpc.transaction.updateSplit.useMutation();
  const createSplit = trpc.transaction.createSplit.useMutation();
  const removeSplit = trpc.transaction.removeSplit.useMutation();
  const queryClient = trpc.useContext();

  const [unsavedCategoryArray, setUnsavedCategoryArray] = useState<
    CategoryClientSide[]
  >(props.transaction.categoryArray);
  const [unsavedSplitArray, setSplitArr] = useState<SplitClientSide[]>(
    props.transaction.splitArray,
  );

  const { amount } = props.transaction;
  let updatedTotalSplit =
    unsavedSplitArray.length > 1
      ? Math.floor(
          unsavedSplitArray.reduce(
            (amount, split) => amount + split.amount,
            0,
          ) * 100,
        ) / 100
      : -1;
  const categorySplitTotal = unsavedCategoryArray.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  );

  const saveChanges = async () => {
    if (!appUser) return;

    if (!props.transaction.inDB) {
      await createTransaction.mutateAsync({
        splitArray: unsavedSplitArray,
        userId: appUser.id,
        transactionId: props.transaction.transaction_id,
      });
    } else {
      unsavedSplitArray.forEach(async (unsavedSplit) => {
        if (
          props.transaction.splitArray.find(
            (split) => split.id === unsavedSplit.id,
          )
        ) {
          await updateSplit.mutateAsync({
            split: unsavedSplit,
          });
        } else {
          await createSplit.mutateAsync({
            split: unsavedSplit,
          });
        }
      });
    }

    queryClient.transaction.getTransactionArray.refetch();
    props.setTransaction({
      ...props.transaction,
      splitArray: unsavedSplitArray,
      categoryArray: unsavedCategoryArray,
    });
  };

  return (
    <Modal setShowModal={props.setShowModal}>
      <div className="flex flex-col ">
        <div className="flex flex-col gap-y-2 justify-between font-semibold text-xl sm:text-2xl">
          <h3>{props.transaction.name}</h3>
          <div className="flex gap-x-2 items-center">
            <h3>${amount * -1}</h3>
            <ActionBtn className="gap-x-2">
              <Icon icon="lucide:split" width={16} />
              Split
            </ActionBtn>
          </div>
        </div>

        <Category
          unsavedCategoryArray={unsavedCategoryArray}
          setUnsavedCategoryArray={setUnsavedCategoryArray}
          setTransaction={props.setTransaction}
          transaction={props.transaction}
        />
      </div>

      <div className="flex w-full flex-col gap-y-1">
        {unsavedSplitArray.length > 1 &&
          unsavedSplitArray.map((split, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-x-2 sm:gap-x-3"
            >
              {appUser &&
                (split.userId === appUser.id ? (
                  <div className="w-5 aspect-square"></div>
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
                        transactionId: props.transaction.transaction_id,
                        userId: split.userId,
                      });

                      updatedSplitArray.splice(i, 1);

                      if (updatedSplitArray.length === 1) {
                        updatedSplitArray.pop();
                        await removeSplit.mutateAsync({
                          transactionId: props.transaction.transaction_id,
                          userId: appUser.id,
                        });
                      }

                      queryClient.transaction.getTransactionArray.refetch();

                      setSplitArr(updatedSplitArray);
                      console.log("updatedSplitArray:", updatedSplitArray);
                      props.setTransaction({
                        ...props.transaction,
                        splitArray: updatedSplitArray,
                      });
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
                  className="flex min-h-[20px] aspect-square"
                  onClick={() => {
                    const updatedSplitArray = [...unsavedSplitArray];
                    let newSplitAmount =
                      Math.floor(
                        (split.amount - updatedTotalSplit + amount) * 100,
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
              ) : (
                <div className="min-h-[20px] aspect-square"></div>
              )}

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
                {split.userId.slice(0, 8)}
              </UserSplit>
            </div>
          ))}
      </div>

      <div className="text-red-800 h-5">
        {updatedTotalSplit !== amount &&
          unsavedSplitArray.length > 0 &&
          `Split is ${updatedTotalSplit > amount ? "greater " : "less "}
          than the amount (${`props.totalSplit $${updatedTotalSplit}`})`}
      </div>

      <div>
        <h3 className="font-semibold">Friends</h3>
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
                        transactionId: props.transaction.transaction_id,
                        userId: appUser.id,
                        amount,
                      });

                    updatedSplitArray.push({
                      id: user.id,
                      transactionId: props.transaction.transaction_id,
                      userId: user.id,
                      amount: 0,
                    });

                    setSplitArr(updatedSplitArray);
                  }}
                >
                  Split
                </ActionBtn>
              </div>
            ),
          )}
      </div>

      <div className="flex w-full justify-between">
        <ActionBtn
          disabled={
            (updatedTotalSplit !== amount && updatedTotalSplit !== -1) ||
            categorySplitTotal !== amount
          }
          onClick={async () => {
            if (!appUser) return;

            if (!props.transaction.inDB) {
              await createTransaction.mutateAsync({
                splitArray: unsavedSplitArray,
                userId: appUser.id,
                transactionId: props.transaction.transaction_id,
              });
            } else {
              unsavedSplitArray.forEach(async (unsavedSplit) => {
                if (
                  props.transaction.splitArray.find(
                    (split) => split.id === unsavedSplit.id,
                  )
                ) {
                  await updateSplit.mutateAsync({
                    split: unsavedSplit,
                  });
                } else {
                  await createSplit.mutateAsync({
                    split: unsavedSplit,
                  });
                }
              });
            }

            queryClient.transaction.getTransactionArray.refetch();
            props.setTransaction({
              ...props.transaction,
              splitArray: unsavedSplitArray,
            });
          }}
        >
          Save changes
        </ActionBtn>

        <ActionBtn variant="negative" onClick={() => props.setShowModal(false)}>
          Cancel
        </ActionBtn>
      </div>

      <details className="" onClick={(e) => e.stopPropagation()}>
        <summary>Raw Data</summary>
        <pre className="max-h-[50vh] overflow-y-scroll whitespace-pre-wrap">
          {JSON.stringify(props.transaction, null, 2)}
        </pre>
      </details>
    </Modal>
  );
};

export default TransactionModal;
