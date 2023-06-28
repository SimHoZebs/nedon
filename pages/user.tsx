import React from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import Link from "next/link";
import SanboxLink from "../lib/comp/user/SanboxLinkBtn";
import { trpc } from "../lib/util/trpc";
import { AuthGetResponse } from "plaid";

const User: NextPage = () => {
  const { appUser, isPaymentInitiation } = useStoreState((state) => state);

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000 }
  );

  return (
    <section>
      <SanboxLink />

      {auth.data && (
        <div>
          {(auth.data as AuthGetResponse).accounts.map((account, index) => (
            <pre key={index}>{JSON.stringify(account, null, 2)}</pre>
          ))}
          <pre>
            {JSON.stringify((auth.data as AuthGetResponse).item, null, 2)}
          </pre>
        </div>
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
