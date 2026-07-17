import { ActionBtn, Button } from "@/comp/shared/Button";
import FinancialConnections from "@/comp/shared/FinancialConnections";
import Input from "@/comp/shared/Input";
import LinkBtn from "@/comp/shared/LinkBtn";
import SimpleFinBtn from "@/comp/shared/SimpleFinBtn";

import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useEffect, useId, useState } from "react";

const Profile = () => {
  const { user: appUser, isLoading } = useAutoLoadUser();
  const [unsavedUser, setUnsavedUser] = useState(appUser);

  const isDev = process.env.NODE_ENV === "development";
  const updateName = trpc.user.updateName.useMutation();
  useEffect(() => {
    if (!isLoading) setUnsavedUser(appUser);
  }, [appUser, isLoading]);

  const nameId = useId();

  return (
    <main className="flex h-full w-full flex-col items-center gap-y-1">
      {unsavedUser ? (
        <section className="flex w-full max-w-lg flex-col items-start gap-y-2">
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
          {unsavedUser.hasFinancialConnection || (
            <div className="flex w-full flex-col gap-3">
              <LinkBtn />
              <SimpleFinBtn />
            </div>
          )}
          <FinancialConnections />
          {isDev && (
            <div>
              <pre>{JSON.stringify(appUser, null, 2)}</pre>
            </div>
          )}
        </section>
      ) : (
        <div>appUser loading...</div>
      )}
    </main>
  );
};

export default Profile;
