import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import { isTx } from "@/types/tx";

import AccountName from "./AccountName";
import Cat from "./Cat/Cat";
import Receipt from "./Receipt";
import SplitList from "./SplitList/SplitList";

import { Prisma } from "@prisma/client";
import useAppUser from "lib/hooks/useAppUser";
import { ActionBtn, CloseBtn, SecondaryBtn } from "lib/shared/Button";
import { H1 } from "lib/shared/Heading";
import Modal from "lib/shared/Modal";
import Image from "next/image";
import type { AuthGetResponse } from "plaid";
import { useEffect, useId } from "react";

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
    (store) => store.txOrganizedByTimeArray,
  );
  const appUser = useAppUser();
  const auth = trpc.plaid.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const queryClient = trpc.useUtils();
  const focusedSplitTxIndex = useTxStore((state) => state.focusedSplitTxIndex);

  const resetTxOnModal = useTxStore((state) => state.revertToTxInDB);
  const setSplitTxAmountDisplayArray = useTxStore(
    (state) => state.setSplitTxAmountDisplayArray,
  );
  const setFocusedSplitTxIndex = useTxStore((s) => s.setFocusedSplitTxIndex);
  const setIsEditingSplitTx = useTxStore((state) => state.setIsEditingSplitTx);
  const YMD = useTxStore((state) => state.txOnModalIndex);

  const amount = tx ? tx.amount : 0;
  const recurring = useId();

  useEffect(() => {
    if (!tx) {
      return;
    }
    setSplitTxAmountDisplayArray(
      tx.splitTxArray.map((split) => split.amount.toString()),
    );
  }, [setSplitTxAmountDisplayArray, tx]);

  useEffect(() => {
    if (txOragnizedByTimeArray.length === 0) return;

    if (!YMD) return;

    console.log("resetTxOnModal");
    resetTxOnModal();
  }, [txOragnizedByTimeArray, YMD, resetTxOnModal]);

  const onClose = () => {
    resetTxOnModal();
    setSplitTxAmountDisplayArray([]);
    setFocusedSplitTxIndex(undefined);
    setIsEditingSplitTx(false);
  };

  const accountName = auth.isLoading
    ? ""
    : (auth.data as unknown as AuthGetResponse).accounts.find(
        (account) => account.account_id === tx?.accountId,
      )?.name || "";

  return (
    tx && (
      <Modal className="gap-y-2">
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
              <AccountName
                isDesktop={true}
                isLoading={auth.isLoading}
                accountName={accountName}
              />
            </div>

            <div className="flex w-full flex-col items-start font-light text-xs text-zinc-400 md:text-sm lg:w-auto lg:items-end">
              <CloseBtn
                isForDesktop
                onClose={() => {
                  onClose();
                  props.onClose();
                }}
              />

              <div className="flex w-full justify-between">
                <AccountName
                  isDesktop={false}
                  isLoading={auth.isLoading}
                  accountName={accountName}
                />
                <div className="flex flex-col items-end">
                  <p>
                    Authorized at{" "}
                    {tx.plaidTx?.authorized_date || "1970-01-23 12:34:56"}
                  </p>
                  <p>
                    Posted at {tx.datetime?.toString() || "1970-01-23 12:34:56"}
                  </p>

                  {tx.plaidTx?.location.address && (
                    <div className="flex">
                      <span className="icon-[mdi--location-on-outline]" />
                      <p>
                        {tx.plaidTx?.location.address &&
                          JSON.stringify(tx.plaidTx?.location)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col justify-between gap-y-3 px-3">
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col gap-x-3 gap-y-1 md:flex-row md:items-center md:justify-between">
                <div className="flex">
                  <H1>${Prisma.Decimal.mul(amount, -1).toNumber()}</H1>
                  {appUser?.myConnectionArray &&
                    appUser.myConnectionArray.length > 0 &&
                    focusedSplitTxIndex === undefined &&
                    tx.splitTxArray.length < 2 && (
                      <SecondaryBtn onClick={() => setFocusedSplitTxIndex(0)}>
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

                <div className="flex items-center">
                  <input type="checkbox" id={recurring} onChange={() => {}} />
                  <label htmlFor={recurring}>Recurring</label>
                </div>
                <Receipt />
              </div>
            </div>

            <div className="flex flex-col items-start gap-y-3">
              <ActionBtn
                onClickAsync={async () => {
                  if (!isTx(tx)) {
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
