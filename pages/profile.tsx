import { ActionBtn, Button } from "@/comp/shared/Button";
import Input from "@/comp/shared/Input";
import type { UnAuthUserClientSide } from "@/types/user";

import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useEffect, useId, useState } from "react";

const Profile = () => {
  const { user: appUser, isLoading } = useAutoLoadUser();
  const [unsavedUser, setUnsavedUser] = useState(appUser);

  const updateName = trpc.user.updateName.useMutation();
  const connectToPlaid = trpc.user.connectToPlaid.useMutation({
    onSuccess: () => {
      queryClient.user.get.invalidate();
    },
  });
  const queryClient = trpc.useUtils();

  const connectUnAuthUserToPlaid = async (user: UnAuthUserClientSide) => {
    const connectToPlaidResult = await connectToPlaid.mutateAsync({
      id: user.id,
    });
    if (!connectToPlaidResult.ok) {
      console.error("Failed to connect to Plaid:", connectToPlaidResult.error);
      return;
    }

    console.log("Connected to Plaid successfully");
  };

  useEffect(() => {
    if (!isLoading) setUnsavedUser(appUser);
  }, [appUser, isLoading]);

  const nameId = useId();

  return (
    <main className="flex h-full w-full flex-col items-center gap-y-1">
      {unsavedUser ? (
        <section className="flex w-full max-w-lg flex-col items-start">
          <Button className="flex gap-x-2 self-end rounded-lg bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200">
            <span className="icon-[mdi--edit]" />
            Manage
          </Button>
          <label htmlFor={nameId}>Name</label>
          <Input
            id={nameId}
            type="text"
            value={unsavedUser.name}
            onChange={(e) =>
              setUnsavedUser({ ...unsavedUser, name: e.target.value })
            }
          />
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateName.mutateAsync(unsavedUser);
            }}
          >
            Save
          </ActionBtn>
          <ActionBtn onClickAsync={() => connectUnAuthUserToPlaid(unsavedUser)}>
            Connect to Plaid
          </ActionBtn>
          <pre>{JSON.stringify(appUser, null, 2)}</pre>
        </section>
      ) : (
        <div>appUser loading...</div>
      )}
    </main>
  );
};

export default Profile;
