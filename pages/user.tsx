import React, { useState } from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import Link from "next/link";
import SanboxLink from "../lib/comp/user/SanboxLinkBtn";
import { trpc } from "../lib/util/trpc";
import { AccountBase, AuthGetResponse } from "plaid";
import Modal from "../lib/comp/Modal";

const User: NextPage = () => {
  const { appUser, isPaymentInitiation } = useStoreState((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();

  const auth = trpc.auth.useQuery<AuthGetResponse | null>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000 }
  );

  return (
    <section className="flex h-full w-full flex-col gap-y-3">
      <SanboxLink />

      {showModal && (
        <Modal setShowModal={setShowModal}>
          <pre>{JSON.stringify(clickedAccount, null, 2)}</pre>
        </Modal>
      )}

      {auth.data && (
        <>
          {auth.data.accounts.map(
            (account, index) =>
              account.balances.available && (
                <div
                  key={index}
                  className="flex justify-between rounded-md bg-zinc-800 p-3 text-lg hover:bg-zinc-700 hover:text-zinc-100"
                  onClick={() => {
                    setClickedAccount(account);
                    setShowModal(true);
                  }}
                >
                  <div>{account.name}</div>
                  <div>${account.balances.available}</div>
                </div>
              )
          )}

          <pre>
            {JSON.stringify((auth.data as AuthGetResponse).item, null, 2)}
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
