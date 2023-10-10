import { Icon } from "@iconify-icon/react";
import Image from "next/image";
import { AuthGetResponse } from "plaid";
import React, { useEffect } from "react";

import { ActionBtn } from "@/comp/Button";
import { H1 } from "@/comp/Heading";
import Modal from "@/comp/Modal";

import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { trpc } from "@/util/trpc";

import Category from "./Category/Category";
import SplitList from "./SplitList/SplitList";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionModal = (props: Props) => {
  const transaction = useTransactionStore((state) => state.transactionOnModal);
  const appUser = useStore((state) => state.appUser);
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
        <div className="flex flex-col justify-between gap-y-2">
          <div className="flex flex-col items-start gap-y-2">
            <div className="flex flex-col lg:flex-row gap-3 justify-between w-full">
              <div className="flex flex-col gap-y-1">
                <div className="flex w-full justify-between">
                  <div className="flex gap-x-2 items-center">
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
                  <button
                    className="mb-1 flex w-6 h-6"
                    onClick={() => props.setShowModal(false)}
                  >
                    <Icon
                      icon="iconamoon:close-fill"
                      width={24}
                      height={24}
                      className="rounded-full lg:hidden text-zinc-400 outline outline-1 hover:text-pink-400"
                    />
                  </button>
                </div>

                <p
                  className={`h-6 w-40 ${
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

              <div className="flex flex-col items-start  lg:items-end text-sm font-light text-zinc-400">
                <button
                  className="mb-1 lg:flex hidden w-6 h-6"
                  onClick={() => props.setShowModal(false)}
                >
                  <Icon
                    icon="iconamoon:close-fill"
                    width={24}
                    height={24}
                    className="rounded-full text-zinc-400 outline outline-1 hover:text-pink-400"
                  />
                </button>
                <p>
                  Created at {transaction.datetime || "1970-01-23 12:34:56"}
                </p>
                <p>
                  Authorized at{" "}
                  {transaction.authorized_datetime || "1970-01-23 12:34:56"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-y-1 ">
            <div>
              <SplitList>
                <H1>${amount * -1}</H1>
              </SplitList>
            </div>

            <div>
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
        </div>
      </Modal>
    )
  );
};

export default TransactionModal;
