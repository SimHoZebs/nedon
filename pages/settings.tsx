import { useRouter } from "next/router";
import React from "react";

import { ActionBtn, Button } from "@/comp/Button";
import { H2 } from "@/comp/Heading";
import CreateUserBtn from "@/comp/user/CreateuserBtn";

import getAppUser from "@/util/getAppUser";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const Settings = () => {
  const router = useRouter();
  const verticalCatPicker = useStore((state) => state.verticalCatPicker);
  const setVerticalCatPicker = useStore((state) => state.setVerticalCatPicker);

  const { appUser } = getAppUser();
  const appGroup = trpc.group.get.useQuery(
    { id: appUser?.groupArray?.[0].id || "" },
    { staleTime: Number.POSITIVE_INFINITY, enabled: !!appUser },
  );

  const { allUsers } = getAppUser();
  const deleteAll = trpc.user.deleteAll.useMutation();
  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();
  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();
  const queryClient = trpc.useUtils();

  return (
    <section className="flex h-full w-full flex-col items-start gap-y-3">
      <ActionBtn
        variant="negative"
        className="gap-x-2"
        onClick={() => {
          router.push("/");
        }}
      >
        <span className="icon-[mdi--logout] h-4 w-4 text-zinc-600 group-hover:text-zinc-500" />
        logout
      </ActionBtn>

      <div className="flex gap-x-2">
        <input
          type="checkbox"
          id="verticalCatPicker"
          checked={verticalCatPicker}
          onChange={(e) => {
            setVerticalCatPicker(e.target.checked);
          }}
        />
        <label htmlFor="verticalCatPicker">make cat picker vertical</label>
      </div>

      <H2>DEBUG AREA</H2>
      <div className="flex flex-col gap-3">
        {allUsers.data ? "User list" : "Loading available accounts...."}
        {allUsers.data?.map((user) => (
          <div className="flex rounded-md bg-zinc-800 p-1" key={user.id}>
            <div>
              <p>Name: {user.name}</p>
              <p>id: {user.id}</p>
            </div>
            {
              <Button
                className={`after:h-full after:w-px after:bg-zinc-500 ${
                  appGroup.data?.userArray?.find(
                    (groupUser) => groupUser.id === user.id,
                  )
                    ? "text-pink-400"
                    : "text-indigo-400"
                }`}
                onClickAsync={async (e) => {
                  e.stopPropagation();
                  if (!appGroup.data) return;

                  appGroup.data.userArray?.find(
                    (groupUser) => groupUser.id === user.id,
                  )
                    ? await removeUserFromGroup.mutateAsync({
                        groupId: appGroup.data.id,
                        userId: user.id,
                      })
                    : await addUserToGroup.mutateAsync({
                        userId: user.id,
                        groupId: appGroup.data.id,
                      });

                  await queryClient.user.getAll.invalidate();
                  await queryClient.group.get.invalidate();
                }}
              >
                {appGroup.data?.userArray?.find(
                  (groupUser) => groupUser.id === user.id,
                ) ? (
                  <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
                ) : (
                  <span className="icon-[mdi--user-add-outline] h-5 w-5" />
                )}
              </Button>
            }

            <Button
              title="Delete user"
              className="text-pink-400 hover:text-pink-500"
              onClickAsync={async (e) => {
                e.stopPropagation();
                if (user.groupArray && user.groupArray.length > 0) {
                  await deleteGroup.mutateAsync({
                    id: user.groupArray[0].id,
                  });
                }

                await deleteUser.mutateAsync(user.id);
                queryClient.user.getAll.invalidate();
              }}
            >
              <span className="icon-[mdi--delete-outline] h-5 w-5" />
            </Button>
          </div>
        ))}
        <CreateUserBtn />
        <ActionBtn
          variant="negative"
          onClickAsync={async () => {
            deleteAll.mutateAsync();
          }}
        >
          <span className="icon-[mdi--delete-outline] h-5 w-5" />
          DELETE ALL EXISTING ACCOUNTS
        </ActionBtn>
      </div>
    </section>
  );
};

export default Settings;
