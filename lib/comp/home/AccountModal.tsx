import { AccountBase } from "plaid";
import React, { useMemo } from "react";

import Modal from "@/comp/Modal";

import { organizeTransactionByTime } from "@/util/transaction";
import { trpc } from "@/util/trpc";

import { CloseBtn } from "../Button";
import DateSortedTransactionList from "../DateSortedTransactionList";
import { H1, H2, H3, H4 } from "../Heading";

interface Props {
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  clickedAccount: AccountBase;
}

const AccountModal = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });
  const appUser = allUsers.data?.[0];

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const sortedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [[[[]]]];
    const filteredTxArray = transactionArray.data.filter(
      (tx) => tx.account_id === props.clickedAccount?.account_id,
    );
    return organizeTransactionByTime(filteredTxArray);
  }, [props.clickedAccount?.account_id, transactionArray.data]);

  return (
    <Modal setShowModal={props.setShowModal}>
      <div className="flex h-full w-full flex-col items-end justify-between">
        <CloseBtn setShowModal={props.setShowModal} />

        <div className="flex h-full w-full flex-col items-end justify-between overflow-hidden lg:flex-row lg:items-start">
          <div className="flex w-full flex-row justify-between lg:flex-col lg:justify-normal">
            <div className="">
              <H1>{props.clickedAccount.name}</H1>
              <p className="text-zinc-400 ">
                {props.clickedAccount.official_name}
              </p>
            </div>
            <div className="flex flex-col items-end lg:items-start">
              <H3>Current: ${props.clickedAccount.balances.available}</H3>
              <H3>Available: ${props.clickedAccount.balances.current}</H3>
            </div>
          </div>
          <section className="flex h-full w-full flex-col gap-y-3 p-1 lg:max-w-lg">
            <H2>Transaction History</H2>
            <DateSortedTransactionList
              sortedTransactionArray={sortedTransactionArray}
              setShowModal={props.setShowModal}
            />
          </section>
          C
        </div>
      </div>
    </Modal>
  );
};

export default AccountModal;
