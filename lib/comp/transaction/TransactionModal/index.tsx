import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { SplitClientSide } from "../../../util/types";
import UserSplit from "./UserSplit";
import Button from "../../Button/PrimaryBtn";
import { useStoreState } from "../../../util/store";
import { trpc } from "../../../util/trpc";
import { PlaidTransaction } from "../../../util/types";
import { Icon } from "@iconify-icon/react";
import NegativeBtn from "../../Button/NegativeBtn";
import Category from "./Category";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTransaction: PlaidTransaction;
  splitArray: SplitClientSide[];
  setSplitArray: React.Dispatch<React.SetStateAction<SplitClientSide[]>>;
}

const TransactionModal = (props: Props) => {
  const { appUser, appGroup } = useStoreState((state) => state);
  const transactionMetaArray = trpc.transaction.getMeta.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );
  const createTransactionMeta = trpc.transaction.createMeta.useMutation();
  const updateTransactionMeta = trpc.transaction.updateSplit.useMutation();
  const [totalSplit, setTotalSplit] = useState(0);

  useEffect(() => {
    const updatedTotalSplit =
      Math.floor(
        props.splitArray.reduce((amount, split) => amount + split.amount, 0) *
          100
      ) / 100;
    setTotalSplit(updatedTotalSplit);
  }, [props.splitArray]);

  return (
    <Modal setShowModal={props.setShowModal}>
      <div className="flex flex-col">
        <div className="flex justify-between font-semibold">
          <h3 className="text-2xl">{props.selectedTransaction.name}</h3>
          <h3 className="text-2xl">${props.selectedTransaction.amount * -1}</h3>
        </div>

        <div className="flex w-full items-center gap-x-1 text-sm text-zinc-400">
          <button className="flex rounded-full p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-400">
            <Icon icon="mdi:shape-plus-outline" height={16} />
          </button>

          <Category selectedTransaction={props.selectedTransaction} />
        </div>
      </div>

      <div className="flex w-full flex-col gap-y-1">
        {props.splitArray.length > 1 &&
          props.splitArray?.map((split, i) => (
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
                    const newSplitArray = [...props.splitArray];
                    newSplitArray.splice(i, 1);
                    props.setSplitArray(newSplitArray);
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
                  const updatedSplitArray = [...props.splitArray];
                  updatedSplitArray[i] = updatedSplit;
                  props.setSplitArray(updatedSplitArray);
                }}
                amount={props.selectedTransaction.amount}
                split={split}
              >
                {split.userId.slice(0, 8)}
              </UserSplit>

              {totalSplit !== props.selectedTransaction.amount && (
                <Button
                  className="flex gap-x-1 text-sm"
                  onClick={() => {
                    const newSplitArray = [...props.splitArray];
                    let newSplitAmount =
                      Math.floor(
                        (split.amount -
                          totalSplit +
                          props.selectedTransaction.amount) *
                          100
                      ) / 100;

                    if (newSplitAmount < 0) newSplitAmount = 0;

                    newSplitArray[i].amount = newSplitAmount;
                    props.setSplitArray(newSplitArray);
                  }}
                >
                  <Icon icon="cil:balance-scale" width={16} height={16} />
                  adjust
                </Button>
              )}
            </div>
          ))}
      </div>

      {totalSplit !== props.selectedTransaction.amount && (
        <div className="text-red-800">
          Split is{" "}
          {totalSplit > props.selectedTransaction.amount ? "greater " : "less "}
          than the transaction amount ({`props.totalSplit $${totalSplit}`})
        </div>
      )}

      <div>
        <h3 className="font-semibold">Friends</h3>
        {appGroup?.userArray &&
          appGroup.userArray.length &&
          appGroup.userArray.map((user, i) =>
            props.splitArray.find(
              (split) => split.userId === user.id
            ) ? null : (
              <div key={i} className="flex">
                <div>{user.id.slice(0, 8)}</div>
                <Button
                  onClick={() => {
                    const newSplitArray = [...props.splitArray];
                    newSplitArray.push({
                      id: null,
                      transactionId: props.selectedTransaction.transaction_id,
                      userId: user.id,
                      amount: 0,
                    });
                    props.setSplitArray(newSplitArray);
                  }}
                >
                  Split
                </Button>
              </div>
            )
          )}
      </div>

      <div className="flex w-full justify-between">
        <Button
          disabled={totalSplit !== props.selectedTransaction.amount}
          onClick={async () => {
            if (!appUser) return;

            const meta = transactionMetaArray.data?.find(
              (meta) => meta.id === props.selectedTransaction.transaction_id
            );

            meta
              ? await updateTransactionMeta.mutateAsync({
                  splitArray: props.splitArray,
                  transactionId: props.selectedTransaction.transaction_id,
                })
              : await createTransactionMeta.mutateAsync({
                  splitArray: props.splitArray,
                  userId: appUser.id,
                  transactionId: props.selectedTransaction.transaction_id,
                  categoryArray: props.selectedTransaction.category || [],
                });

            transactionMetaArray.refetch();
          }}
        >
          Save changes
        </Button>

        <NegativeBtn onClick={() => props.setShowModal(false)}>
          Cancel
        </NegativeBtn>
      </div>

      <details className="" onClick={(e) => e.stopPropagation()}>
        <summary>Raw Data</summary>
        <pre className="max-h-[50vh] overflow-y-scroll whitespace-pre-wrap">
          {JSON.stringify(props.selectedTransaction, null, 2)}
        </pre>
      </details>
    </Modal>
  );
};

export default TransactionModal;
