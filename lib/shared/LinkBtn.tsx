import { trpc } from "@/util/trpc";

import { ActionBtn } from "./Button";

import useAppUser from "lib/hooks/useAppUser";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

const LinkBtn = () => {
  const appUser = useAppUser();
  const linkToken = trpc.plaid.createLinkToken.useQuery(undefined, {
    staleTime: 360000,
  });

  const router = useRouter();

  const onSuccess = React.useCallback(
    (_public_token: string) => {
      const getUserAccessToken = async () => {
        if (!appUser) {
          console.error("appUser is undefined.");
          return;
        }
      };

      getUserAccessToken();

      router.push("/home");
    },
    [appUser, router],
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
