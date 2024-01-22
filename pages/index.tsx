import { NextPage } from "next";
import { AccountBase, AuthGetResponse } from "plaid";
import React, { useRef, useState } from "react";

import { H1 } from "@/comp/Heading";
import AccountCard from "@/comp/home/AccountCard";
import AccountModal from "@/comp/home/AccountModal";

import { trpc } from "@/util/trpc";

const User: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700"></div>,
  );

  return (
    <section className="flex h-full w-full flex-col items-center gap-y-3">
      <H1>All Accounts</H1>
      {showModal && clickedAccount && (
        <AccountModal
          setShowModal={setShowModal}
          clickedAccount={clickedAccount}
        />
      )}

      <div className="flex w-full max-w-md flex-col gap-y-3">
        {auth.fetchStatus === "idle" && auth.status !== "pending" ? (
          auth.data ? (
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
            )
          ) : (
            <div>
              Your connection is fine, but we could not find any accounts in our
              database.
            </div>
          )
        ) : (
          Array.from({ length: 3 }).map((val, index) => (
            <AccountCard key={index} disabled={true}>
              {loading.current}
              {loading.current}
            </AccountCard>
          ))
        )}
      </div>
    </section>
  );
};

export default User;
