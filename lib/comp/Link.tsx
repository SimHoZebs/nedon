import React, { useEffect, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import Button from "plaid-threads/Button";

import { useStoreActions, useStoreState } from "../util/store";
import { trpc } from "../util/trpc";

const Link = () => {
  const { linkToken, isPaymentInitiation } = useStoreState((state) => state);
  const {
    setLinkToken,
    setIsPaymentInitiation,
    setIsItemAccess,
    setItemId,
    setAccessToken,
    setLinkSuccess,
  } = useStoreActions((actions) => actions);
  const server = trpc.useContext();

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const exchangePublicTokenForAccessToken = async () => {
        const response = await fetch("/api/set_access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `public_token=${public_token}`,
        });

        if (!response.ok) {
          setItemId(`no item_id retrieved`);
          setAccessToken(`no access_token retrieved`);
          setIsItemAccess(false);
          return;
        }
        const data = await response.json();
        setItemId(data.item_id);
        setAccessToken(data.access_token);
        setIsItemAccess(true);
      };

      // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
      if (isPaymentInitiation) {
        setIsItemAccess(false);
      } else {
        exchangePublicTokenForAccessToken();
      }

      setLinkSuccess(true);
      window.history.pushState("", "", "/");
    },
    [
      isPaymentInitiation,
      setAccessToken,
      setIsItemAccess,
      setItemId,
      setLinkSuccess,
    ]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  if (window.location.href.includes("?oauth_state_id=")) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <Button type="button" large onClick={() => open()} disabled={!ready}>
      Launch Link
    </Button>
  );
};

Link.displayName = "Link";

export default Link;
