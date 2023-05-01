import React from "react";
import Link from "next/link";
import LinkBtn from "./LinkBtn";
import { useStoreState } from "../util/store";

const Header = () => {
  const { linkToken, linkTokenError } = useStoreState((state) => state);

  return (
    <div className="">
      <h3 className="text-5xl">Plaid Quickstart</h3>
      <>
        <h4 className="text-4xl">A sample end-to-end integration with Plaid</h4>
        <p className="">
          The Plaid flow begins when your user wants to connect their bank
          account to your app. Simulate this by clicking the button below to
          launch Link - the client-side component that your users will interact
          with in order to link their accounts to Plaid and allow you to access
          their accounts via the Plaid API.
        </p>

        {/* message if there is no link token */}
        {linkToken == null ? (
          <div className="border-dotted border-red-500">
            <div>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured correctly.
            </div>
            <div>
              If you are on a Windows machine, please ensure that you have
              cloned the repo with
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
            <LinkBtn />
          </div>
        )}
      </>
    </div>
  );
};

Header.displayName = "Header";

export default Header;
