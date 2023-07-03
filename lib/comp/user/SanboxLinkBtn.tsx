import React from "react";
import { trpc } from "../../util/trpc";
import Button from "../Button/PrimaryBtn";
import { useStoreState, useStoreActions } from "../../util/store";

const SanboxLink = () => {
  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000 }
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
  const { appUser } = useStoreState((state) => state);
  const { setAppUser } = useStoreActions((action) => action);

  return (
    <div>
      <Button
        disabled={!sandboxPublicToken.data}
        onClick={async () => {
          if (!sandboxPublicToken.data || !appUser) return;

          const user = await setAccessToken.mutateAsync({
            publicToken: sandboxPublicToken.data,
            id: appUser.id,
          });

          setAppUser((prev) => ({ ...user }));
        }}
      >
        Link bank account (Sandbox)
      </Button>
      <p
        className={`text-sm ${
          sandboxPublicToken.error ? "text-red-400" : "text-zinc-400"
        }`}
      >
        {sandboxPublicToken.isFetching && "Loading..."}
        {sandboxPublicToken.error &&
          "Plaid or your internet is down. Check Plaid's uptime or your internet."}
      </p>
    </div>
  );
};

export default SanboxLink;
