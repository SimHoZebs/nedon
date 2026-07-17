import { trpc } from "@/util/trpc";

import { ActionBtn } from "./Button";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";

const LinkBtn = () => {
  const appUser = useAutoLoadUser();
  const completeConnection = trpc.financial.completeConnection.useMutation();
  const connectionFlow = trpc.financial.beginConnection.useQuery(
    { userId: appUser.user?.id || "", provider: "PLAID" },
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

        const result = await completeConnection.mutateAsync({
          userId: appUser.user.id,
          provider: "PLAID",
          completion: { type: "embeddedToken", token: publicToken },
        });
        if (!result.initialSync.ok) {
          console.error(
            "Initial financial sync failed",
            result.initialSync.error,
          );
          return;
        }

        await router.push("/");
      };

      exchangeToken();
    },
    [appUser.user, completeConnection, router],
  );

  let isOauth = false;

  const config: Parameters<typeof usePlaidLink>[0] = {
    token:
      connectionFlow.data?.type === "embedded"
        ? connectionFlow.data.token
        : null,
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
      {connectionFlow.data
        ? "Link a bank account"
        : "Waiting for connection token..."}
    </ActionBtn>
  );
};

LinkBtn.displayName = "Link";

export default LinkBtn;
