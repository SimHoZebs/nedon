import { trpc } from "@/util/trpc";

import { ActionBtn } from "./Button";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

const LinkBtn = () => {
  const appUser = useAutoLoadUser();
  const exchangeConnectionToken =
    trpc.bank.exchangeConnectionToken.useMutation();
  const linkToken = trpc.bank.createConnectionIntent.useQuery(
    { userId: appUser.user?.id || "" },
    {
      staleTime: 360000,
    },
  );

  const router = useRouter();

  const onSuccess = React.useCallback(
    (publicToken: string) => {
      const exchangeToken = async () => {
        if (!appUser.user) {
          console.error("appUser is undefined.");
          return;
        }

        const result = await exchangeConnectionToken.mutateAsync({
          userId: appUser.user.id,
          publicToken,
        });

        if (!result.ok) {
          console.error(
            "Failed to exchange bank connection token",
            result.error,
          );
          return;
        }

        await router.push("/");
      };

      exchangeToken();
    },
    [appUser.user, exchangeConnectionToken, router],
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
