import { ActionBtn, Button } from "@/comp/Button";
import Input from "@/comp/Input";
import useAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import React, { useEffect, useState } from "react";

const Profile = () => {
  const { appUser } = useAppUser();
  const updateProfile = trpc.user.update.useMutation();
  const [unsavedUser, setUnsavedUser] = useState(appUser);

  useEffect(() => {
    setUnsavedUser(appUser);
  }, [appUser]);

  return (
    unsavedUser && (
      <main className="flex h-full w-full flex-col items-center gap-y-1">
        <section className="flex w-full max-w-lg flex-col items-start">
          <Button className="flex gap-x-2 self-end rounded-lg bg-zinc-800 text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200">
            <span className="icon-[mdi--edit]" />
            Manage
          </Button>
          <label htmlFor="name">Name</label>
          <Input
            id="name"
            type="text"
            value={unsavedUser.name}
            onChange={(e) =>
              setUnsavedUser({ ...unsavedUser, name: e.target.value })
            }
          />
          <ActionBtn
            variant="primary"
            onClick={() => {
              updateProfile.mutateAsync(unsavedUser);
            }}
          >
            Save
          </ActionBtn>
          <pre>{JSON.stringify(appUser, null, 2)}</pre>
        </section>
      </main>
    )
  );
};

export default Profile;
