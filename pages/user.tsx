import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { Button } from "@/comp/Button";
import { H1 } from "@/comp/Heading";

import { useLocalStore } from "@/util/store";
import { trpc } from "@/util/trpc";

const Home: NextPage = () => {
  const addUserId = useLocalStore((state) => state.addUserId);
  const deleteUserId = useLocalStore((state) => state.deleteUserId);
  const setUserIdArray = useLocalStore((state) => state.setUserIdArray);

  //userIdArray will never be undefined due to enable condition.
  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const appGroup = trpc.group.get.useQuery(
    { id: appUser?.groupArray?.[0].id || "" },
    { staleTime: Infinity, enabled: !!appUser },
  );

  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();

  useEffect(() => {
    if (!allUsers.data) {
      allUsers.status === "loading"
        ? console.debug("Can't sync userIdArray. allUsers is loading.")
        : console.error("Can't sync serIdArray. Fetching allUsers failed.");
      return;
    }

    setUserIdArray(allUsers.data.map((user) => user.id));
  }, [allUsers.data, allUsers.status, setUserIdArray]);

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-y-3 text-center">
      <H1>
        {!allUsers.data
          ? "Loading available accounts...."
          : "Choose an account"}
      </H1>

      {addUserId && (
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
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!appGroup.data) return;

                              const updatedAppGroup =
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
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (user.groupArray && user.groupArray.length > 0) {
                            await deleteGroup.mutateAsync({
                              id: user.groupArray[0].id,
                            });
                          }

                          await deleteUser.mutateAsync(user.id);
                          deleteUserId(user.id);
                        }}
                      >
                        <span className="icon-[mdi--delete-outline] h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ),
            )}

          <CreateUserBtn addUserId={addUserId} />
        </div>
      )}

      <p>
        This is a very early preview. Viewing on desktop is recommended, but a
        responsive mobile view is in the works. Feel free to make issues of any
        bug found.
      </p>
    </section>
  );
};

interface Props {
  addUserId: (userId: string) => void;
}

const CreateUserBtn = (props: Props) => {
  const createUser = trpc.user.create.useMutation();
  const createGroup = trpc.group.create.useMutation();

  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="flex w-full items-center justify-center gap-x-2 rounded-none rounded-b-md text-xl font-semibold hover:bg-zinc-800 hover:text-zinc-200"
      onClick={async (e) => {
        setLoading(true);
        e.stopPropagation();
        const user = await createUser.mutateAsync();
        await createGroup.mutateAsync({ id: user.id });
        if (createGroup.error) console.error(createGroup.error);

        const publicToken = await sandboxPublicToken.refetch();
        if (!publicToken.data) throw new Error("no public token");

        const userWithAccessToken = await setAccessToken.mutateAsync({
          publicToken: publicToken.data,
          id: user.id,
        });

        props.addUserId(userWithAccessToken.id);
        setLoading(false);
      }}
    >
      {loading ? (
        <div className="flex h-4 w-4">
          <span className="icon-[mdi--loading] h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="flex h-4 w-4">
          <span className="icon-[mdi--plus-thick] h-4 w-4" />
        </div>
      )}
      create user
    </Button>
  );
};

export default Home;
