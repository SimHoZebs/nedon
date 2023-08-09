import React, { useEffect } from "react";
import Modal from "@/comp/Modal";
import { useStore } from "@/util/store";
import ActionBtn from "@/comp/Button/ActionBtn";
import Category from "./Category/Category";
import H1 from "@/comp/H1";
import SplitList from "./SplitList/SplitList";
import { trpc } from "@/util/trpc";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionModal = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const transaction = useStore((state) => state.transactionOnModal);
  const refreshDBData = useStore((state) => state.refreshDBData);
  const resetTransaction = useStore((state) => state.resetTransactionOnModal);
  const unsavedSplitArray = useStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useStore((state) => state.setUnsavedSplitArray);

  const transactionWithoutPlaid = trpc.transaction.getWithoutPlaid.useQuery(
    { transactionId: transaction?.id || "", userId: appUser?.id || "" },
    { enabled: !!transaction && !!appUser?.id }
  );
  const deleteTransaction = trpc.transaction.delete.useMutation();
  const queryClient = trpc.useContext();

  useEffect(() => {
    console.debug("dependency updated");
    //data is null when transaction not inDB.
    if (transactionWithoutPlaid.data === null) {
      resetTransaction();
    } else if (transactionWithoutPlaid.data) {
      refreshDBData(transactionWithoutPlaid.data);
      setUnsavedSplitArray(transactionWithoutPlaid.data.splitArray);
    }
  }, [
    refreshDBData,
    resetTransaction,
    setUnsavedSplitArray,
    transactionWithoutPlaid.data,
  ]);

  const amount = transaction ? transaction.amount : 0;

  return (
    transaction && (
      <Modal setShowModal={props.setShowModal}>
        <div className="flex flex-col justify-between gap-y-2">
          <div className="flex items-start justify-between gap-y-2">
            <H1>{transaction.name}</H1>
            <div className="flex flex-col text-sm font-light text-zinc-400">
              <p>Created at {transaction.datetime || "1970-01-23 12:34:56"}</p>
              <p>
                Authorized at{" "}
                {transaction.authorized_datetime || "1970-01-23 12:34:56"}
              </p>
            </div>
          </div>

          {unsavedSplitArray.length && (
            <div className="flex justify-between">
              <div className="flex flex-col ">
                <SplitList>
                  <H1>${amount * -1}</H1>
                </SplitList>
              </div>

              <Category />
            </div>
          )}
        </div>

        <div className="flex w-full justify-between">
          <ActionBtn
            variant="negative"
            onClick={() => props.setShowModal(false)}
          >
            Cancel
          </ActionBtn>

          <ActionBtn
            onClick={async () => {
              if (!transaction.inDB) {
                console.error(
                  "deleteTransaction denied. transaction not in db."
                );
                return;
              }

              await deleteTransaction.mutateAsync({
                id: transaction.id,
              });

              await queryClient.transaction.invalidate();
            }}
          >
            Reset transaction data
          </ActionBtn>
        </div>

        <details className="" onClick={(e) => e.stopPropagation()}>
          <summary>Raw Data</summary>
          <pre className="max-h-[50vh] overflow-y-scroll whitespace-pre-wrap">
            {JSON.stringify(transaction, null, 2)}
          </pre>
        </details>
      </Modal>
    )
  );
};

export default TransactionModal;
