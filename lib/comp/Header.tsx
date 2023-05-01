import React from "react";
import LinkTag from "next/link";

import Link from "./Link";

import { useStoreState } from "../util/store";

const Header = () => {
  const {
    itemId,
    accessToken,
    linkToken,
    linkSuccess,
    isItemAccess,
    linkTokenError,
    isPaymentInitiation,
  } = useStoreState((state) => state);

  return (
    <div className="">
      <h3 className="text-5xl">Plaid Quickstart</h3>

      {!linkSuccess ? (
        <>
          <h4 className="text-4xl">
            A sample end-to-end integration with Plaid
          </h4>
          <p className="">
            The Plaid flow begins when your user wants to connect their bank
            account to your app. Simulate this by clicking the button below to
            launch Link - the client-side component that your users will
            interact with in order to link their accounts to Plaid and allow you
            to access their accounts via the Plaid API.
          </p>

          {/* message if there is no link token */}
          {linkToken == null ? (
            <div className="border-dotted border-red-500">
              <div>
                Unable to fetch link_token: please make sure your backend server
                is running and that your .env file has been configured
                correctly.
              </div>
              <div>
                If you are on a Windows machine, please ensure that you have
                cloned the repo with
                <LinkTag
                  href="https://github.com/plaid/quickstart#special-instructions-for-windows"
                  target="_blank"
                >
                  symlinks turned on.
                </LinkTag>
                You can also try checking your
                <LinkTag
                  href="https://dashboard.plaid.com/activity/logs"
                  target="_blank"
                >
                  activity log
                </LinkTag>
                on your Plaid dashboard.
              </div>
              <div>
                Error Code: <code>{linkTokenError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkTokenError.error_type}</code>
              </div>
              <div>Error Message: {linkTokenError.error_message}</div>
            </div>
          ) : (
            <div className="">
              <Link />
            </div>
          )}
        </>
      ) : (
        <>
          {isPaymentInitiation ? (
            <>
              <h4 className="">
                Congrats! Your payment is now confirmed.
                <p />
                <div className="border-red-500 border-dotted">
                  You can see information of all your payments in the
                  <LinkTag
                    href="https://dashboard.plaid.com/activity/payments"
                    target="_blank"
                  >
                    Payments Dashboard
                  </LinkTag>
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
              {isItemAccess ? (
                <h4 className="">
                  Congrats! By linking an account, you have created an
                  <LinkTag
                    href="http://plaid.com/docs/quickstart/glossary/#item"
                    target="_blank"
                  >
                    Item
                  </LinkTag>
                  .
                </h4>
              ) : (
                <h4 className="">
                  <div className="border-red-500 border-dotted">
                    Unable to create an item. Please check your backend server
                  </div>
                </h4>
              )}
              <div className="">
                <p className="">
                  <span className="">item_id</span>
                  <span className="">{itemId}</span>
                </p>

                <p className="">
                  <span className="">access_token</span>
                  <span className="">{accessToken}</span>
                </p>
              </div>
              {isItemAccess && (
                <p className="">
                  Now that you have an access_token, you can make all of the
                  following requests:
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

Header.displayName = "Header";

export default Header;
