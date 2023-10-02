import { Icon } from "@iconify-icon/react";
import { NextPage } from "next";
import { AccountBase, AuthGetResponse } from "plaid";
import React, { useMemo, useRef, useState } from "react";

import { H1, H2, H3, H4 } from "@/comp/Heading";
import Modal from "@/comp/Modal";
import AccountCard from "@/comp/home/AccountCard";
import TransactionCard from "@/comp/transaction/TransactionCard";

import { useStore } from "@/util/store";
import { organizeTransactionByTime } from "@/util/transaction";
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

  const sortedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [[[[]]]];
    const filteredTxArray = transactionArray.data.filter(
      (tx) => tx.account_id === clickedAccount?.account_id,
    );
    return organizeTransactionByTime(filteredTxArray);
  }, [clickedAccount?.account_id, transactionArray.data]);

  return (
    <section className="flex h-full w-full items-center flex-col gap-y-3">
      <H1>All Accounts</H1>
      {showModal && clickedAccount && (
        <Modal setShowModal={setShowModal}>
          <div className="w-full flex flex-col justify-between h-full items-end">
            <button className="mb-1 flex" onClick={() => setShowModal(false)}>
              <Icon
                icon="iconamoon:close-fill"
                width={24}
                height={24}
                className="rounded-full text-zinc-400 outline outline-1 hover:text-pink-400"
              />
            </button>

            <div className="flex flex-col w-full justify-between h-full lg:flex-row items-end lg:items-start overflow-hidden">
              <div className="flex w-full flex-row lg:flex-col justify-between lg:justify-normal">
                <div className="">
                  <H1>{clickedAccount.name}</H1>
                  <p className="text-zinc-400 ">
                    {clickedAccount.official_name}
                  </p>
                </div>
                <div className="flex flex-col items-end lg:items-start">
                  <H3>Current: ${clickedAccount.balances.available}</H3>
                  <H3>Available: ${clickedAccount.balances.current}</H3>
                </div>
              </div>

              <ol className="flex flex-col gap-y-3 overflow-y-scroll w-full lg:max-w-lg p-1 h-full no-scrollbar">
                <H2>Transaction History</H2>
                {sortedTransactionArray.map((year, i) => (
                  <li className="flex w-full flex-col" key={i}>
                    <ol className="flex flex-col gap-y-1">
                      {year.map((month, j) => (
                        <li key={j} className="w-full flex-col gap-y-1">
                          <H3>{month[0][0]?.date.slice(5, 7)}</H3>
                          <ol className="flex flex-col gap-y-1">
                            {month.map((day, k) => (
                              <li
                                className="flex w-full flex-col gap-y-1"
                                key={k}
                              >
                                <H4>{day[0]?.date.slice(8)}</H4>
                                <ol className="flex flex-col gap-y-2">
                                  {day.map(
                                    (transaction, l) =>
                                      transaction && (
                                        <TransactionCard
                                          setShowModal={setShowModal}
                                          transaction={transaction}
                                          key={l}
                                        />
                                      ),
                                  )}
                                </ol>
                              </li>
                            ))}
                          </ol>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
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
