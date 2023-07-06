import React, { useRef, useState } from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import Link from "next/link";
import SanboxLink from "../lib/comp/analysis/SanboxLinkBtn";
import { trpc } from "../lib/util/trpc";
import { AccountBase, AuthGetResponse } from "plaid";
import Modal from "../lib/comp/Modal";
import AccountCard from "../lib/comp/home/AccountCard";

const User: NextPage = () => {
  const { appUser, isPaymentInitiation } = useStoreState((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser }
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700"></div>
  );

  return appUser && !appUser.hasAccessToken ? (
    <section className="flex h-full flex-col items-center justify-center gap-y-3">
      <h1 className="text-3xl">{"No bank account linked to this user."}</h1>
      <SanboxLink />
    </section>
  ) : (
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

      {auth.data && (
        <>
          {(auth.data as unknown as AuthGetResponse).accounts.map(
            (account, index) =>
              account.balances.available && (
                <AccountCard
                  key={index}
                  onClick={() => {
                    setClickedAccount(account);
                    setShowModal(true);
                  }}
                >
                  <div>{account.name}</div>
                  <div>${account.balances.available}</div>
                </AccountCard>
              )
          )}

          <pre className="whitespace-pre-wrap">
            {JSON.stringify(
              (auth.data as unknown as AuthGetResponse).item,
              null,
              2
            )}
          </pre>
        </>
      )}

      {isPaymentInitiation && (
        <div>
          <h4 className="">
            Congrats! Your payment is now confirmed.
            <p />
            <div className="border-dotted border-red-500">
              You can see information of all your payments in the
              <Link
                href="https://dashboard.plaid.com/activity/payments"
                target="_blank"
              >
                Payments Dashboard
              </Link>
              .
            </div>
          </h4>
          <p className="">
            Now that the payment id stored in your server, you can use it to
            access the payment information:
          </p>
        </div>
      )}
    </section>
  );
};

export default User;
