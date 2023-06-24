import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

import { useStoreActions, useStoreState } from "../util/store";
import { trpc } from "../util/trpc";
import { useRouter } from "next/router";
import Button from "./Button";

const LinkBtn = () => {
  const { appUser } = useStoreState((state) => state);
  const { setAppUser } = useStoreActions((actions) => actions);
  const setAccessToken = trpc.setAccessToken.useMutation();
  const linkToken = trpc.createLinkToken.useQuery(undefined, {
    staleTime: 360000,
  });

  const router = useRouter();

  const onSuccess = React.useCallback(
    (public_token: string) => {
      // If the access_token is needed, send public_token to server
      const getUserAccessToken = async () => {
        const user = await setAccessToken.mutateAsync({
          publicToken: public_token,
          id: appUser.id,
        });

        if (!user.hasAccessToken) {
          console.log("error setting access token from server");
        }

        setAppUser((prev) => ({ ...user }));
      };

      getUserAccessToken();

      router.push("/user");
    },
    [appUser.id, router, setAccessToken, setAppUser]
  );

  let isOauth = false;

  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken.data ? linkToken.data : null,
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
      {linkToken.data ? "Link a bank account" : "Waiting for link token..."}
    </Button>
  );
};

LinkBtn.displayName = "Link";

export default LinkBtn;
