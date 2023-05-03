import React from "react";
import { useStoreState } from "../lib/util/store";
import { NextPage } from "next";

import ProductContainer from "../lib/comp/Products";
import Items from "../lib/comp/Items";

import Link from "next/link";

const User: NextPage = () => {
  const { user, isPaymentInitiation } = useStoreState((state) => state);

  return (
    <>
      {isPaymentInitiation ? (
        <>
          <h4 className="">
            Congrats! Your payment is now confirmed.
            <p />
            <div className="border-red-500 border-dotted">
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
        </>
      ) : (
        /* If not using the payment_initiation product, show the item_id and access_token information */ <>
          {user.ITEM_ID ? (
            <h4 className="">
              Congrats! By linking an account, you have created an{" "}
              <Link
                href="http://plaid.com/docs/quickstart/glossary/#item"
                target="_blank"
              >
                Item
              </Link>
              .
            </h4>
          ) : (
            <h4 className="">
              <div className="border-red-500 border-dotted">
                Unable to create an item. Please check your backend server
              </div>
            </h4>
          )}

          {user.ITEM_ID && (
            <p className="">
              Now that you have an access_token, you can make all of the
              following requests:
            </p>
          )}

          {isPaymentInitiation && <ProductContainer />}
          {user.ITEM_ID && (
            <>
              <ProductContainer />
              <Items />
            </>
          )}
        </>
      )}
    </>
  );
};

export default User;
