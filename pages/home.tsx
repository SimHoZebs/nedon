import { NextPage } from "next";
import { AccountBase, AuthGetResponse } from "plaid";
import React, { useRef, useState } from "react";

import { H1, H2, H3 } from "@/comp/Heading";
import Modal from "@/comp/Modal";
import AccountCard from "@/comp/home/AccountCard";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const User: NextPage = () => {
  const appUser = useStore((state) => state.appUser);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700"></div>,
  );

  return (
    <section className="flex h-full w-full flex-col gap-y-3">
      {showModal && clickedAccount && (
        <Modal setShowModal={setShowModal}>
          <H1>{clickedAccount.name}</H1>
          <p className="text-zinc-400">{clickedAccount.official_name}</p>
          <H3>Current: ${clickedAccount.balances.available}</H3>
          <H3>Available: ${clickedAccount.balances.current}</H3>
        </Modal>
      )}

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
    </section>
  );
};

export default User;
