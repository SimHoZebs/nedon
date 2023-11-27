import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

import { ActionBtn } from "./Button";

const LinkBtn = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const setAppUser = useStore((state) => state.setAppUser);
  const setAccessToken = trpc.setAccessToken.useMutation();
  const linkToken = trpc.createLinkToken.useQuery(undefined, {
    staleTime: 360000,
  });

  const router = useRouter();

  const onSuccess = React.useCallback(
    (public_token: string) => {
      const getUserAccessToken = async () => {
        if (!appUser) {
          console.error("appUser is undefined.");
          return;
        }

        const user = await setAccessToken.mutateAsync({
          publicToken: public_token,
          id: appUser.id,
        });

        if (!user.hasAccessToken) {
          console.error("unable to set access token from server");
        }

        setAppUser({ ...user });
      };

      getUserAccessToken();

      router.push("/home");
    },
    [appUser, router, setAccessToken, setAppUser],
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
    <ActionBtn onClick={() => open()}>
      {linkToken.data ? "Link a bank account" : "Waiting for link token..."}
    </ActionBtn>
  );
};

LinkBtn.displayName = "Link";

export default LinkBtn;
