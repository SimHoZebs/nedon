import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

import { useStoreActions, useStoreState } from "../util/store";
import { trpc } from "../util/trpc";
import { useRouter } from "next/router";
import Button from "./Button";

const LinkBtn = () => {
  const { linkToken, isPaymentInitiation, user } = useStoreState(
    (state) => state
  );
  const { setIsItemAccess, setItemId, setUser, setLinkSuccess } =
    useStoreActions((actions) => actions);
  const setAccessTokenServer = trpc.setAccessToken.useMutation();
  const router = useRouter();

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
          setIsItemAccess(false);
          return;
        }

        setItemId(response.item_id);
        setUser((user) => ({
          ...user,
          hasAccessToken: response.access_token ? true : false,
        }));
        setIsItemAccess(true);
      };

      // 'payment_initiation' products do not require the public_token to be exchanged for an access_token.
      if (isPaymentInitiation) {
        setIsItemAccess(false);
      } else {
        exchangePublicTokenForAccessToken();
      }

      setLinkSuccess(true);
      router.push("/user");
    },
    [
      isPaymentInitiation,
      router,
      setAccessTokenServer,
      setIsItemAccess,
      setItemId,
      setLinkSuccess,
      setUser,
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
    <Button onClick={() => open()}>
      {linkToken ? "Link a bank account" : "Waiting for link token..."}
    </Button>
  );
};

LinkBtn.displayName = "Link";

export default LinkBtn;
