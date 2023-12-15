import Image from "next/image";
import { AuthGetResponse } from "plaid";
import React, { useEffect } from "react";

import { ActionBtn, CloseBtn } from "@/comp/Button";
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
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const setUnsavedSplitArray = useTransactionStore(
    (state) => state.setUnsavedSplitArray,
  );
  const resetTransaction = useTransactionStore(
    (state) => state.resetTransaction,
  );

  const deleteTransaction = trpc.transaction.delete.useMutation();
  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const queryClient = trpc.useUtils();

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
    <>
      {transaction && (
        <Modal setShowModal={props.setShowModal}>
          <div className="flex flex-col justify-between gap-y-2 overflow-clip">
            <section className="flex w-full flex-col items-start justify-between gap-3 gap-y-2 lg:flex-row">
              <div className="flex w-full flex-col gap-y-1 lg:w-fit">
                <div className="flex w-full items-start justify-between">
                  <div className="flex items-center gap-x-2">
                    {transaction.counterparties &&
                      transaction.counterparties[0]?.logo_url && (
                        <Image
                          className="rounded-lg"
                          src={transaction.counterparties[0].logo_url}
                          alt=""
                          width={56}
                          height={56}
                        />
                      )}

                    <H1>{transaction.name}</H1>
                  </div>

                  <CloseBtn isForMobile setShowModal={props.setShowModal} />
                </div>

                <p
                  className={`h-6 w-40 rounded-lg ${
                    auth.isLoading && "animate-pulse bg-zinc-700"
                  } `}
                >
                  {auth.isLoading
                    ? ""
                    : (auth.data as unknown as AuthGetResponse).accounts.find(
                        (account) =>
                          account.account_id === transaction.account_id,
                      )?.name || ""}
                </p>
              </div>

              <div className="flex flex-col items-start  text-sm font-light text-zinc-400 lg:items-end">
                <CloseBtn setShowModal={props.setShowModal} />
                <p>
                  Created at {transaction.datetime || "1970-01-23 12:34:56"}
                </p>
                <p>
                  Authorized at{" "}
                  {transaction.authorized_datetime || "1970-01-23 12:34:56"}
                </p>
              </div>
            </section>

            <div className="flex flex-col justify-between gap-y-3 md:flex-row ">
              <div>
                <SplitList>
                  <H1>${amount * -1}</H1>
                </SplitList>
              </div>

              <div className="flex flex-col items-start gap-y-3">
                <Category />

                <ActionBtn
                  onClickAsync={async () => {
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
          </div>
        </Modal>
      )}
    </>
  );
};

export default TransactionModal;
