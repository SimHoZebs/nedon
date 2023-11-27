import { NextPage } from "next";
import { AccountBase, AuthGetResponse } from "plaid";
import React, { useMemo, useRef, useState } from "react";

import { H1, H2, H3, H4 } from "@/comp/Heading";
import Modal from "@/comp/Modal";
import AccountCard from "@/comp/home/AccountCard";
import TransactionCard from "@/comp/transaction/TransactionCard";

import { organizeTransactionByTime } from "@/util/transaction";
import { trpc } from "@/util/trpc";

const User: NextPage = () => {
  // const appUser = useStore((state) => state.appUser);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

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
    <section className="flex h-full w-full flex-col items-center gap-y-3">
      <H1>All Accounts</H1>
      {showModal && clickedAccount && (
        <Modal setShowModal={setShowModal}>
          <div className="flex h-full w-full flex-col items-end justify-between">
            <button
              aria-label="Close"
              className="mb-1 flex"
              onClick={() => setShowModal(false)}
            >
              <span className="icon-[iconamoon--close-fill] h-6 w-6 rounded-full text-zinc-400 outline outline-1 hover:text-pink-400" />
            </button>

            <div className="flex h-full w-full flex-col items-end justify-between overflow-hidden lg:flex-row lg:items-start">
              <div className="flex w-full flex-row justify-between lg:flex-col lg:justify-normal">
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

              <ol className="flex h-full w-full flex-col gap-y-3 p-1 lg:max-w-lg">
                <H2>Transaction History</H2>
                {sortedTransactionArray.map((year, i) => (
                  <li
                    className="no-scrollbar flex w-full flex-col items-center overflow-y-scroll"
                    key={Math.random() * (i + 1)}
                  >
                    <ol className="flex flex-col gap-y-1">
                      {year.map((month, j) => (
                        <li
                          key={Math.random() * (j + 1)}
                          className="w-full flex-col gap-y-1"
                        >
                          <H3>{month[0][0]?.date.slice(5, 7)}</H3>
                          <ol className="flex flex-col gap-y-1">
                            {month.map((day, k) => (
                              <li
                                className="flex w-full flex-col gap-y-1"
                                key={Math.random() * (k + 1)}
                              >
                                <H4>{day[0]?.date.slice(8)}</H4>
                                <ol className="flex flex-col gap-y-2">
                                  {day.map(
                                    (transaction, l) =>
                                      transaction && (
                                        <TransactionCard
                                          setShowModal={setShowModal}
                                          transaction={transaction}
                                          key={transaction.transaction_id}
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

      <div className="flex w-full max-w-md flex-col gap-y-3">
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
