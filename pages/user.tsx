import React from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import ProductContainer from "../lib/comp/user/Products";
import Items from "../lib/comp/user/Items";

import Link from "next/link";
import { useRouter } from "next/router";
import SanboxLink from "../lib/comp/user/SanboxLinkBtn";

const User: NextPage = () => {
  const { appUser, linkToken, isPaymentInitiation } = useStoreState(
    (state) => state
  );

  const router = useRouter();

  return (
    <>
      {isPaymentInitiation && (
        <section>
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
        </section>
      )}

      {linkToken == null ? (
        <section className="text-lg font-semibold text-red-500">
          <div>
            Unable to fetch link_token: please make sure your backend server is
            running and that your .env file has been configured correctly.
          </div>
          <div>
            If you are on a Windows machine, please ensure that you have cloned
            the repo with
            <Link
              href="https://github.com/plaid/quickstart#special-instructions-for-windows"
              target="_blank"
            >
              symlinks turned on.
            </Link>
            You can also try checking your
            <Link
              href="https://dashboard.plaid.com/activity/logs"
              target="_blank"
            >
              activity log
            </Link>
            on your Plaid dashboard.
          </div>
        </section>
      ) : (
        <div className="">
          <SanboxLink />
        </div>
      )}

      {appUser.ITEM_ID && (
        <p className="">
          Congrats! By linking an account, you have created an{" "}
          <Link
            href="http://plaid.com/docs/quickstart/glossary/#item"
            target="_blank"
          >
            Item
          </Link>
          . Now that you have an access_token, you can make all of the following
          requests:
        </p>
      )}

      {appUser.ITEM_ID && (
        <section>
          <ProductContainer />
          <Items />
        </section>
      )}
    </>
  );
};

export default User;
