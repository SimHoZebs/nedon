import Image from "next/image";
import { AuthGetResponse } from "plaid";
import React, { useEffect } from "react";

import { ActionBtn, CloseBtn } from "@/comp/Button";
import { H1 } from "@/comp/Heading";
import Modal from "@/comp/Modal";

import getAppUser from "@/util/getAppUser";
import { calcSplitAmount } from "@/util/split";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import Cat from "./Cat/Cat";
import SplitList from "./SplitList/SplitList";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSplitAmountChange: (index: number, splitAmount: string) => void;
}

const TxModal = (props: Props) => {
  const tx = useTxStore((state) => state.txOnModal);
  const deleteTx = trpc.tx.delete.useMutation();
  const { appUser } = getAppUser();
  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const queryClient = trpc.useUtils();

  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const setSplitAmountDisplayArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );
  const resetTx = useTxStore((state) => state.resetTx);

  const amount = tx ? tx.amount : 0;

  useEffect(() => {
    console.debug("txModal dependencies updated");
    if (!tx) {
      console.error("Unable to set unsavedSplitArray. tx is undefined");
      return;
    }

    setUnsavedSplitArray(tx.splitArray);
  }, [setUnsavedSplitArray, tx]);

  useEffect(() => {
    setSplitAmountDisplayArray(
      unsavedSplitArray.map((split) => calcSplitAmount(split).toString()),
    );
  }, [setSplitAmountDisplayArray, unsavedSplitArray]);

  return (
    <>
      {tx && (
        <Modal setShowModal={props.setShowModal}>
          <div className="flex flex-col justify-between gap-y-2">
            <section className="flex w-full flex-col items-start justify-between gap-3 gap-y-2 px-3 pt-3 lg:flex-row">
              <div className="flex w-full flex-col gap-y-1 lg:w-fit">
                <div className="flex w-full items-start justify-between">
                  <div className="flex items-center gap-x-2">
                    {tx.counterparties && tx.counterparties[0]?.logo_url && (
                      <Image
                        className="rounded-lg"
                        src={tx.counterparties[0].logo_url}
                        alt=""
                        width={56}
                        height={56}
                      />
                    )}

                    <H1>{tx.name}</H1>
                  </div>

                  <CloseBtn
                    isForMobile
                    onClose={() => {
                      props.setShowModal(false);
                    }}
                  />
                </div>

                <p
                  className={`h-6 w-40 rounded-lg ${
                    auth.isLoading && "animate-pulse bg-zinc-700"
                  } `}
                >
                  {auth.isLoading
                    ? ""
                    : (auth.data as unknown as AuthGetResponse).accounts.find(
                        (account) => account.account_id === tx.account_id,
                      )?.name || ""}
                </p>
              </div>

              <div className="flex flex-col items-start  text-sm font-light text-zinc-400 lg:items-end">
                <CloseBtn
                  onClose={() => {
                    props.setShowModal(false);
                  }}
                />
                <p>Created at {tx.datetime || "1970-01-23 12:34:56"}</p>
                <p>
                  Authorized at{" "}
                  {tx.authorized_datetime || "1970-01-23 12:34:56"}
                </p>
              </div>
            </section>

            <div className="flex flex-col justify-between gap-y-3 md:flex-row ">
              <div>
                <SplitList
                  onAmountChange={(index, splitAmount) => {
                    props.onSplitAmountChange(index, splitAmount);
                  }}
                >
                  <H1 className="px-3">${amount * -1}</H1>
                </SplitList>
              </div>

              <div className="flex flex-col items-start gap-y-3">
                <Cat />

                <ActionBtn
                  onClickAsync={async () => {
                    if (!tx.id) {
                      console.error("Can't delete tx. tx not in db.");
                      return;
                    }

                    resetTx();
                    await deleteTx.mutateAsync({ id: tx.id });

                    queryClient.tx.invalidate();
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

export default TxModal;
