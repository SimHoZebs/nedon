import React from "react";
import Modal from "../../Modal";
import { useStoreState } from "../../../util/store";
import ActionBtn from "../../Button/ActionBtn";
import Category from "./Category/Category";
import H1 from "../../H1";
import Split from "./Split";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionModal = (props: Props) => {
  const { currentTransaction: transaction } = useStoreState((state) => state);

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

          <div className="flex justify-between">
            <div className="flex flex-col ">
              <Split>
                <H1>${amount * -1}</H1>
              </Split>
            </div>

            <Category />
          </div>
        </div>

        <div className="flex w-full justify-between">
          {/* <ActionBtn
            disabled={categorySplitTotal !== amount}
            onClick={async () => {
              if (!appUser) return;

              if (!transaction.inDB) {
                await createTransaction.mutateAsync({
                  categoryTreeArray: unsavedCategoryTreeArray,
                  userId: appUser.id,
                  transactionId: transaction.transaction_id,
                });
              } else {
                // unsavedSplitArray.forEach(async (unsavedSplit) => {
                //   if (
                //     props.transaction.splitArray.find(
                //       (split) => split.id === unsavedSplit.id
                //     )
                //   ) {
                //     await updateSplit.mutateAsync({
                //       split: unsavedSplit,
                //     });
                //   } else {
                //     await createSplit.mutateAsync({
                //       split: unsavedSplit,
                //     });
                //   }
                // });

                await upsertTransaction.mutateAsync({
                  transactionId: transaction.transaction_id,
                  categoryTreeArray: unsavedCategoryTreeArray,
                });
              }

              queryClient.transaction.getTransactionArray.refetch();
              setTransaction(() => ({
                ...transaction,
                categoryTreeArray: [], //unsavedCategoryTreeArray,
              }));
            }}
          >
            <Icon icon="material-symbols:save-outline" width={16} />
            Save changes
          </ActionBtn> */}

          <ActionBtn
            variant="negative"
            onClick={() => props.setShowModal(false)}
          >
            Cancel
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
