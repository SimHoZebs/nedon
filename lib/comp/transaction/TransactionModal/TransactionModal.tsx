import React, { useState } from "react";
import Modal from "../../Modal";
import { CategoryTreeClientSide, FullTransaction } from "../../../util/types";
import { useStoreState } from "../../../util/store";
import { trpc } from "../../../util/trpc";
import { Icon } from "@iconify-icon/react";
import ActionBtn from "../../Button/ActionBtn";
import Category from "./Category/Category";
import H3 from "../../H3";
import H2 from "../../H2";

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
  const upsertTransaction = trpc.transaction.upsertManyCategory.useMutation();
  const queryClient = trpc.useContext();

  const [unsavedCategoryTreeArray, setUnsavedCategoryTreeArray] = useState<
    CategoryTreeClientSide[]
  >(props.transaction.categoryTreeArray);

  const { amount } = props.transaction;
  const categorySplitTotal = unsavedCategoryTreeArray.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  return (
    <Modal setShowModal={props.setShowModal}>
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col justify-between gap-y-2 ">
          <H2>{props.transaction.name}</H2>
          <div className="flex items-center gap-x-2">
            <H3>${amount * -1}</H3>
            <ActionBtn className="gap-x-2">
              <Icon icon="lucide:split" width={16} />
              Split
            </ActionBtn>
          </div>
        </div>

        <Category
          unsavedTreeArray={unsavedCategoryTreeArray}
          setUnsavedTreeArray={setUnsavedCategoryTreeArray}
          setTransaction={props.setTransaction}
          transaction={props.transaction}
        />
      </div>

      <div className="flex w-full justify-between">
        <ActionBtn
          disabled={categorySplitTotal !== amount}
          onClick={async () => {
            if (!appUser) return;

            if (!props.transaction.inDB) {
              await createTransaction.mutateAsync({
                categoryTreeArray: unsavedCategoryTreeArray,
                userId: appUser.id,
                transactionId: props.transaction.transaction_id,
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
                transactionId: props.transaction.transaction_id,
                categoryTreeArray: unsavedCategoryTreeArray,
              });
            }

            queryClient.transaction.getTransactionArray.refetch();
            props.setTransaction({
              ...props.transaction,
              categoryTreeArray: unsavedCategoryTreeArray,
            });
          }}
        >
          <Icon icon="material-symbols:save-outline" width={16} />
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
