import { Icon } from "@iconify-icon/react";
import React, { useEffect } from "react";

import { ActionBtn } from "@/comp/Button";
import { H1 } from "@/comp/Heading";
import Modal from "@/comp/Modal";

import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";

import Category from "./Category/Category";
import SplitList from "./SplitList/SplitList";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionModal = (props: Props) => {
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );
  const resetTransaction = useTransactionStore(
    (state) => state.resetTransaction,
  );

  const deleteTransaction = trpc.transaction.delete.useMutation();
  const queryClient = trpc.useContext();

  useEffect(() => {
    console.debug("transactionModal dependencies updated");
    if (!transaction) {
      console.error(
        "Unable to set unsavedSplitArray. transaction is undefined",
      );
      return;
    }

    setUnsavedSplitArray(transaction.splitArray);
  }, [setUnsavedSplitArray, transaction]);

  const amount = transaction ? transaction.amount : 0;

  return (
    transaction && (
      <Modal setShowModal={props.setShowModal}>
        <div className="flex justify-between gap-y-2">
          <div className="flex flex-col items-start gap-y-2">
            <H1>{transaction.name}</H1>

            <SplitList>
              <H1>${amount * -1}</H1>
            </SplitList>
          </div>

          <div className="flex flex-col items-end gap-y-1">
            <button
              className="mb-1 flex"
              onClick={() => props.setShowModal(false)}
            >
              <Icon
                icon="iconamoon:close-fill"
                width={24}
                height={24}
                className="rounded-full text-zinc-400 outline outline-1 hover:text-pink-400"
              />
            </button>

            <div className="flex flex-col items-end text-sm font-light text-zinc-400">
              <p>Created at {transaction.datetime || "1970-01-23 12:34:56"}</p>
              <p>
                Authorized at{" "}
                {transaction.authorized_datetime || "1970-01-23 12:34:56"}
              </p>
            </div>

            <Category />

            <ActionBtn
              onClick={async () => {
                if (!transaction.id) {
                  console.error(
                    "Can't delete transaction. transaction not in db.",
                  );
                  return;
                }

                resetTransaction();
                await deleteTransaction.mutateAsync({ id: transaction.id });

                queryClient.transaction.invalidate();
              }}
            >
              Reset transaction data
            </ActionBtn>
          </div>
        </div>
      </Modal>
    )
  );
};

export default TransactionModal;
