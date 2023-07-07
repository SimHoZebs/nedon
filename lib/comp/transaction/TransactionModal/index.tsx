import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { FullTransaction, SplitClientSide } from "../../../util/types";
import UserSplit from "./UserSplit";
import Button from "../../Button/ActionBtn";
import { useStoreState } from "../../../util/store";
import { trpc } from "../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import ActionBtn from "../../Button/ActionBtn";
import categoryStyle from "../../../util/categoryStyle";
import CategoryPicker from "./CategoryPicker";

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
  const [totalSplit, setTotalSplit] = useState(0);
  const { splitArray, amount } = props.transaction;
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    const updatedTotalSplit =
      Math.floor(
        splitArray.reduce((amount, split) => amount + split.amount, 0) * 100,
      ) / 100;
    setTotalSplit(updatedTotalSplit);
  }, [splitArray]);

  const lastCategory = props.transaction.category?.slice(-1)[0];
  const thisCategoryStyle = lastCategory && categoryStyle[lastCategory];

  return (
    <Modal setShowModal={props.setShowModal}>
      <div className="flex flex-col ">
        <div className="flex justify-between font-semibold ">
          <h3 className="text-2xl">{props.transaction.name}</h3>
          <h3 className="text-2xl">${amount * -1}</h3>
        </div>

        <div className="group p-2 rounded-lg flex w-fit items-center gap-x-2 text-sm text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800">
          <div
            className={`flex rounded-full p-1 text-zinc-700 ${
              (thisCategoryStyle && thisCategoryStyle.color) ||
              "bg-zinc-900 hover:bg-zinc-800 "
            }`}
          >
            <Icon
              icon={
                (thisCategoryStyle && thisCategoryStyle.icon) ||
                "mdi:shape-plus-outline"
              }
              height={24}
            />
          </div>

          <div
            className="relative "
            onClick={() => {
              setShowCategoryPicker((prev) => !prev);
            }}
          >
            <CategoryPicker
              setTransaction={props.setTransaction}
              showCategoryPicker={showCategoryPicker}
              transaction={props.transaction}
              setShowCategoryPicker={setShowCategoryPicker}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-y-1">
        {splitArray.length > 1 &&
          splitArray.map((split, i) => (
            <div
              key={i}
              className="flex w-full items-center gap-x-2 sm:gap-x-3"
            >
              {appUser && split.userId === appUser.id ? (
                <div className="w-5"></div>
              ) : (
                <button
                  className="group flex"
                  onClick={() => {
                    const updatedSplitArray = [...splitArray];
                    updatedSplitArray.splice(i, 1);
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
              )}

              <UserSplit
                onAmountChange={(amount: number) => {
                  const updatedSplit: SplitClientSide = {
                    ...split,
                    amount,
                  };
                  const updatedSplitArray = [...splitArray];
                  updatedSplitArray[i] = updatedSplit;
                  props.setTransaction({
                    ...props.transaction,
                    splitArray: updatedSplitArray,
                  });
                }}
                amount={amount}
                split={split}
              >
                {split.userId.slice(0, 8)}
              </UserSplit>

              {totalSplit !== amount && (
                <Button
                  className="flex gap-x-1 text-sm"
                  onClick={() => {
                    const updatedSplitArray = [...splitArray];
                    let newSplitAmount =
                      Math.floor((split.amount - totalSplit + amount) * 100) /
                      100;

                    if (newSplitAmount < 0) newSplitAmount = 0;

                    updatedSplitArray[i].amount = newSplitAmount;
                    props.setTransaction({
                      ...props.transaction,
                      splitArray: updatedSplitArray,
                    });
                  }}
                >
                  <Icon icon="cil:balance-scale" width={16} height={16} />
                  adjust
                </Button>
              )}
            </div>
          ))}
      </div>

      {totalSplit !== amount && (
        <div className="text-red-800">
          Split is {totalSplit > amount ? "greater " : "less "}
          than the amount ({`props.totalSplit $${totalSplit}`})
        </div>
      )}

      <div>
        <h3 className="font-semibold">Friends</h3>
        {appGroup?.userArray &&
          appGroup.userArray.length &&
          appGroup.userArray.map((user, i) =>
            splitArray.find((split) => split.userId === user.id) ? null : (
              <div key={i} className="flex">
                <div>{user.id.slice(0, 8)}</div>
                <Button
                  onClick={() => {
                    const updatedSplitArray = [...splitArray];
                    updatedSplitArray.push({
                      id: null,
                      transactionId: props.transaction.transaction_id,
                      userId: user.id,
                      amount: 0,
                    });
                    props.setTransaction({
                      ...props.transaction,
                      splitArray: updatedSplitArray,
                    });
                  }}
                >
                  Split
                </Button>
              </div>
            ),
          )}
      </div>

      <div className="flex w-full justify-between">
        <Button
          disabled={totalSplit !== amount}
          onClick={async () => {
            if (!appUser) return;

            props.transaction.inDB
              ? await updateSplit.mutateAsync({
                  splitArray,
                  transactionId: props.transaction.transaction_id,
                })
              : await createTransaction.mutateAsync({
                  splitArray,
                  userId: appUser.id,
                  transactionId: props.transaction.transaction_id,
                  categoryArray: props.transaction.category || [],
                });
          }}
        >
          Save changes
        </Button>

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
