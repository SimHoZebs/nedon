import { NextPage } from "next";
import { AccountBase, AuthGetResponse } from "plaid";
import React, { useRef, useState } from "react";

import { H1, H3 } from "@/comp/Heading";
import Modal from "@/comp/Modal";
import AccountCard from "@/comp/home/AccountCard";
import TransactionCard from "@/comp/transaction/TransactionCard";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const User: NextPage = () => {
  const appUser = useStore((state) => state.appUser);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700"></div>,
  );

  return (
    <section className="flex h-full w-full items-center flex-col gap-y-3">
      <H1>All Accounts</H1>
      {showModal && clickedAccount && (
        <Modal setShowModal={setShowModal}>
          <div className="flex w-full justify-between h-full">
            <div>
              <H1>{clickedAccount.name}</H1>
              <p className="text-zinc-400">{clickedAccount.official_name}</p>
              <H3>Current: ${clickedAccount.balances.available}</H3>
              <H3>Available: ${clickedAccount.balances.current}</H3>
            </div>

            <div className="flex flex-col gap-y-3 overflow-y-scroll w-96 p-1 h-full no-scrollbar">
              {transactionArray.data
                ?.filter(
                  (transaction) =>
                    transaction.account_id === clickedAccount.account_id,
                )
                .map((transaction, i) => (
                  <TransactionCard
                    key={i}
                    transaction={transaction}
                    setShowModal={() => {}}
                  />
                ))}
            </div>
          </div>
        </Modal>
      )}

      <div className="max-w-md w-full flex flex-col gap-y-3">
        {auth.isLoading && (
          <>
            {Array.from({ length: 3 }).map((val, index) => (
              <AccountCard key={index} disabled={true}>
                {loading.current}
                {loading.current}
              </AccountCard>
            ))}
          </>
        )}

        {auth.data &&
          (auth.data as unknown as AuthGetResponse).accounts.map(
            (account, index) =>
              account.balances.available && (
                <AccountCard
                  key={index}
                  onClick={() => {
                    setClickedAccount(account);
                    setShowModal(true);
                  }}
                >
                  <p>{account.name}</p>
                  <p>${account.balances.available}</p>
                </AccountCard>
              ),
          )}
      </div>
    </section>
  );
};

export default User;
