import React from "react";
import { trpc } from "../../util/trpc";
import Button from "../Button";
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
      {sandboxPublicToken.data
        ? "Link bank account (Sandbox)"
        : "Waiting for public token..."}
    </Button>
  );
};

export default SanboxLink;
