import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import { SplitClientSide } from "../../../util/types";
import UserSplit from "./UserSplit";
import Button from "../../Button";
import { useStoreState } from "../../../util/store";
import { trpc } from "../../../util/trpc";
import { Transaction as PlaidTransaction } from "plaid";

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
  const updateTransactionMeta = trpc.transaction.updateMeta.useMutation();
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
      <div className="text-2xl">{props.selectedTransaction.name}</div>
      <div className="text-2xl">${props.selectedTransaction.amount * -1}</div>

      {props.splitArray.length > 1 &&
        props.splitArray?.map((split, i) => (
          <div key={i}>
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

            {/**FIX: if selectedTransaction is from your acc, you shouldn't be able to remove yourself */}
            {appUser && split.userId === appUser.id ? null : (
              <Button
                onClick={() => {
                  const newSplitArray = [...props.splitArray];
                  newSplitArray.splice(i, 1);
                  props.setSplitArray(newSplitArray);
                }}
              >
                Remove
              </Button>
            )}

            {totalSplit !== props.selectedTransaction.amount && (
              <Button
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
                adjust
              </Button>
              //ADD: SCALE ICON
            )}
          </div>
        ))}

      {totalSplit > props.selectedTransaction.amount ? (
        <div className="text-red-900">
          Split is greater than transaction amount (
          {`props.totalSplit${totalSplit}`})
        </div>
      ) : totalSplit < props.selectedTransaction.amount ? (
        <div className="text-red-900">
          Split is less than transaction amount (
          {`props.totalSplit${totalSplit}`})
        </div>
      ) : null}

      <div>
        <div>Friends</div>
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
                });

            transactionMetaArray.refetch();
          }}
        >
          Save changes
        </Button>

        <Button
          className="bg-red-900 hover:bg-red-800"
          onClick={() => props.setShowModal(false)}
        >
          Cancel
        </Button>
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
