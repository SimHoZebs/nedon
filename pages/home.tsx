import React, { useRef, useState } from "react";
import { useStore } from "../lib/util/store";
import { NextPage } from "next";

import { trpc } from "../lib/util/trpc";
import { AccountBase, AuthGetResponse } from "plaid";
import Modal from "../lib/comp/Modal";
import AccountCard from "../lib/comp/home/AccountCard";

const User: NextPage = () => {
  const appUser = useStore((state) => state.appUser);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser }
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700"></div>
  );

  return appUser ? (
    <section className="flex h-full w-full flex-col gap-y-3">
      {showModal && (
        <Modal setShowModal={setShowModal}>
          <pre>{JSON.stringify(clickedAccount, null, 2)}</pre>
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
            )
        )}
    </section>
  ) : null;
};

export default User;
