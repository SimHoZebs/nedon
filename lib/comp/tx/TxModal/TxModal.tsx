import Image from "next/image";
import type { AuthGetResponse } from "plaid";
import React, { useEffect } from "react";

import { ActionBtn, CloseBtn, SecondaryBtn } from "@/comp/Button";
import { H1 } from "@/comp/Heading";
import Modal from "@/comp/Modal";

import getAppUser from "@/util/getAppUser";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import { isTxInDB } from "@/types/tx";

import Cat from "./Cat/Cat";
import Receipt from "./Receipt";
import SplitList from "./SplitList/SplitList";

interface Props {
  onClose: () => void;
  onSplitAmountChange: (index: number, splitAmount: string) => void;
}

const TxModal = (props: Props) => {
  const tx = useTxStore((state) => state.txOnModal);
  const resetTx = trpc.tx.reset.useMutation({
    onSuccess: async (data) => {
      console.log("resetTx success, invalidating tx.getAll", data);
      await queryClient.tx.getAll.invalidate();
      console.log("tx.getAll invalidated");
    },
  });

  const txOragnizedByTimeArray = useStore(
    (store) => store.txOragnizedByTimeArray,
  );
  const { appUser } = getAppUser();
  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const queryClient = trpc.useUtils();
  const focusedIndex = useTxStore((state) => state.focusedSplitIndex);

  const resetTxOnModal = useTxStore((state) => state.resetTx);
  const setSplitAmountDisplayArray = useTxStore(
    (state) => state.setSplitAmountDisplayArray,
  );
  const setFocusedSplitIndex = useTxStore((s) => s.setFocusedSplitIndex);
  const setIsEditingSplit = useTxStore((state) => state.setIsEditingSplit);
  const YMD = useTxStore((state) => state.txOnModalIndex);

  const amount = tx ? tx.amount : 0;

  useEffect(() => {
    if (!tx) {
      return;
    }
    setSplitAmountDisplayArray(
      tx.splitArray.map((split) => split.amount.toString()),
    );
  }, [setSplitAmountDisplayArray, tx]);

  useEffect(() => {
    if (txOragnizedByTimeArray.length === 0) return;

    if (!YMD) return;

    console.log("resetTxOnModal");
    resetTxOnModal();
  }, [txOragnizedByTimeArray, YMD, resetTxOnModal]);

  const onClose = () => {
    resetTxOnModal();
    setSplitAmountDisplayArray([]);
    setFocusedSplitIndex(undefined);
    setIsEditingSplit(false);
  };

  return (
    tx && (
      <Modal>
        <div className="flex flex-col justify-between gap-y-2">
          <section className="flex w-full flex-col items-start justify-between gap-3 gap-y-2 px-3 pt-3 lg:flex-row">
            <div className="flex w-full flex-col gap-y-1 lg:w-fit">
              <div className="flex w-full items-start justify-between">
                <div className="flex items-center gap-x-2">
                  {tx.plaidTx?.counterparties?.[0]?.logo_url && (
                    <Image
                      className="rounded-lg"
                      src={tx.plaidTx.counterparties[0].logo_url}
                      alt=""
                      width={56}
                      height={56}
                    />
                  )}

                  <div className="group flex items-center gap-3">
                    <H1>{tx.name}</H1>
                    <span className="icon-[mdi--edit] invisible h-5 w-5 cursor-pointer text-zinc-400 group-hover:visible" />
                  </div>
                </div>

                <CloseBtn
                  isForMobile
                  onClose={() => {
                    onClose();
                    props.onClose();
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
                      (account) => account.account_id === tx.accountId,
                    )?.name || ""}
              </p>
            </div>

            <div className="flex flex-col items-start text-sm font-light text-zinc-400 lg:items-end">
              <CloseBtn
                isForDesktop
                onClose={() => {
                  onClose();
                  props.onClose();
                }}
              />
              <p>
                Authorized at{" "}
                {tx.plaidTx?.authorized_date || "1970-01-23 12:34:56"}
              </p>
              <p>Posted at {tx.date || "1970-01-23 12:34:56"}</p>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-y-3 px-3">
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col gap-x-3 gap-y-1 md:flex-row md:items-center md:justify-between">
                <div className="flex">
                  <H1 className="px-3">${amount * -1}</H1>
                  {appUser?.myConnectionArray &&
                    appUser.myConnectionArray.length > 0 &&
                    focusedIndex === undefined &&
                    tx.splitArray.length < 2 && (
                      <SecondaryBtn onClick={() => setFocusedSplitIndex(0)}>
                        <span className="icon-[lucide--split] m-1 h-4 w-4" />
                        Split
                      </SecondaryBtn>
                    )}
                </div>
                <Cat />
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <SplitList
                  onAmountChange={(index, splitAmount) => {
                    props.onSplitAmountChange(index, splitAmount);
                  }}
                />
                <Receipt />
              </div>
            </div>

            <div className="flex flex-col items-start gap-y-3">
              <ActionBtn
                onClickAsync={async () => {
                  if (!isTxInDB(tx)) {
                    return;
                  }

                  const resettedTx = await resetTx.mutateAsync(tx);
                  if (!resettedTx) {
                    return;
                  }
                  resetTxOnModal();
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

export default TxModal;
