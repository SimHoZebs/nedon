import React from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import ProductContainer from "../lib/comp/user/Products";
import Items from "../lib/comp/user/Items";

import Link from "next/link";
import SanboxLink from "../lib/comp/user/SanboxLinkBtn";

const User: NextPage = () => {
  const { appUser, isPaymentInitiation } = useStoreState((state) => state);

  return (
    <section>
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

      <SanboxLink />
      {appUser && appUser.ITEM_ID && (
        <>
          <p className="">
            Congrats! By linking an account, you have created an{" "}
            <Link
              href="http://plaid.com/docs/quickstart/glossary/#item"
              target="_blank"
            >
              Item
            </Link>
            . Now that you have an access_token, you can make all of the
            following requests:
          </p>

          <div>
            <ProductContainer />
            <Items />
          </div>
        </>
      )}
    </section>
  );
};

export default User;
