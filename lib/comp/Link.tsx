import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

import { useStoreActions, useStoreState } from "../util/store";
import { trpc } from "../util/trpc";

const Link = () => {
  const { linkToken, isPaymentInitiation, user } = useStoreState(
    (state) => state
  );
  const { setIsItemAccess, setItemId, setAccessToken, setLinkSuccess } =
    useStoreActions((actions) => actions);
  const setAccessTokenServer = trpc.setAccessToken.useMutation();

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const exchangePublicTokenForAccessToken = async () => {
        const response = await setAccessTokenServer.mutateAsync({
          publicToken: public_token,
          id: user.id,
        });

        if (response.error) {
          console.log("error setting access token from server");
          setItemId(`no item_id retrieved`);
          setAccessToken(`no access_token retrieved`);
          setIsItemAccess(false);
          return;
        }

        setItemId(response.item_id);
        setAccessToken(response.access_token);
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
      setAccessTokenServer,
      setIsItemAccess,
      setItemId,
      setLinkSuccess,
      user.id,
    ]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  //For reasons I don't understand, I can't do an && statement instead
  if (typeof window !== "undefined") {
    if (window.location.href.includes("?oauth_state_id=")) {
      // TODO: figure out how to delete this ts-ignore
      // @ts-ignore
      config.receivedRedirectUri = window.location.href;
      isOauth = true;
    }
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <button className="bg-blue-400 p-2 rounded-lg" onClick={() => open()}>
      {linkToken ? "Launch Link" : "Loading..."}
    </button>
  );
};

Link.displayName = "Link";

export default Link;
