import type { NextPage } from "next";
import { useEffect } from "react";

import { Button } from "@/comp/Button";
import { H1 } from "@/comp/Heading";
import CreateUserBtn from "@/comp/user/CreateuserBtn";

import { trpc } from "@/util/trpc";

const Home: NextPage = () => {
  //userIdArray will never be undefined due to enable condition.
  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();
  const queryClient = trpc.useUtils();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const appGroup = trpc.group.get.useQuery(
    { id: appUser?.groupArray?.[0]?.id || "" },
    { staleTime: Infinity, enabled: !!appUser },
  );

  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();

  useEffect(() => {
    if (!allUsers.data) {
      allUsers.status === "pending"
        ? console.debug("Can't sync userIdArray. allUsers is loading.")
        : console.error("Can't sync serIdArray. Fetching allUsers failed.");
      return;
    }
  }, [allUsers.data, allUsers.status]);

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-y-3 text-center">
      <H1>
        {!allUsers.data
          ? "Loading available accounts...."
          : "Choose an account"}
      </H1>

      <div className="flex w-full max-w-xs flex-col items-center rounded-md border border-zinc-600">
        {appUser &&
          allUsers.data &&
          allUsers.data.map(
            (user) =>
              user.id !== appUser.id && (
                <div
                  key={user.id}
                  className="flex w-full items-center justify-between border-b border-zinc-700 p-3 first:rounded-t-md hover:cursor-pointer hover:bg-zinc-800 sm:gap-x-16"
                >
                  <div className="flex gap-x-2">
                    <p>userId: {user.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex h-full min-w-fit items-center gap-x-1">
                    {appUser && appUser.id !== user.id && appGroup.data && (
                      <>
                        <Button
                          className={`after:h-full after:w-px after:bg-zinc-500 ${
                            appGroup.data.userArray?.find(
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
                          {appGroup.data.userArray?.find(
                            (groupUser) => groupUser.id === user.id,
                          ) ? (
                            <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
                          ) : (
                            <span className="icon-[mdi--user-add-outline] h-5 w-5" />
                          )}
                        </Button>

                        <div className="flex h-full w-px bg-zinc-500"></div>
                      </>
                    )}

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
                </div>
              ),
          )}

        <CreateUserBtn />
      </div>

      <p>
        This is a very early preview. Viewing on desktop is recommended, but a
        responsive mobile view is in the works. Feel free to make issues of any
        bug found.
      </p>
    </section>
  );
};

export default Home;
