import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { useLocalStoreDelay, useLocalStore, useStore } from "../lib/util/store";
import { emptyUser } from "../lib/util/user";
import { useRouter } from "next/router";
import { Icon } from "@iconify-icon/react";
import Button from "../lib/comp/Button/Button";
import { useEffect, useState } from "react";
import H1 from "../lib/comp/H1";

const Home: NextPage = () => {
  const router = useRouter();
  const server = trpc.useContext();
  const userIdArray = useLocalStoreDelay(
    useLocalStore,
    (state) => state.userIdArray
  );
  const addUserId = useLocalStore((state) => state.addUserId);
  const deleteUserId = useLocalStore((state) => state.deleteUserId);
  const setUserIdArray = useLocalStore((state) => state.setUserIdArray);

  //userIdArray will never be undefined due to enable condition.
  const allUsers = trpc.user.getAll.useQuery(userIdArray!, {
    staleTime: Infinity,
    enabled: !!userIdArray && userIdArray.length > 0,
  });

  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();

  const appUser = useStore((state) => state.appUser);
  const appGroup = useStore((state) => state.appGroup);
  const setAppUser = useStore((state) => state.setAppUser);
  const setAppGroup = useStore((state) => state.setAppGroup);

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
        {!userIdArray ? "Loading available accounts...." : "Choose an account"}
      </H1>

      {addUserId && (
        <div className="flex flex-col items-center rounded-md border border-zinc-600 ">
          {allUsers.data &&
            allUsers.data.map((user) => (
              <div
                key={user.id}
                className="flex w-full items-center justify-between border-b border-zinc-700 p-3 first:rounded-t-md hover:cursor-pointer hover:bg-zinc-800 sm:gap-x-16"
                onClick={async (e) => {
                  setAppUser(user);

                  if (!user.groupArray) {
                    console.error("Cannot login. User has no groupArray.");
                    return;
                  }

                  const group = await server.group.get.fetch({
                    id: user.groupArray[0].id,
                  });

                  if (!group) {
                    console.error(
                      "Cannot login. server returned undefined group."
                    );
                    return;
                  }
                  setAppGroup(group);
                  router.push("/transactions");
                }}
              >
                <div className="flex gap-x-2">
                  <p>userId: {user.id.slice(0, 8)}</p>
                </div>
                <div className="flex h-full min-w-fit items-center gap-x-1">
                  {appUser && appUser.id !== user.id && appGroup && (
                    <>
                      <Button
                        className={`after:h-full after:w-px after:bg-zinc-500 ${
                          appGroup.userArray?.find(
                            (groupUser) => groupUser.id === user.id
                          )
                            ? "text-pink-400"
                            : "text-indigo-400"
                        }`}
                        onClick={async (e) => {
                          e.stopPropagation();

                          const updatedAppGroup = appGroup.userArray?.find(
                            (groupUser) => groupUser.id === user.id
                          )
                            ? await removeUserFromGroup.mutateAsync({
                                groupId: appGroup.id,
                                userId: user.id,
                              })
                            : await addUserToGroup.mutateAsync({
                                userId: user.id,
                                groupId: appGroup.id,
                              });

                          setAppGroup(updatedAppGroup);
                        }}
                      >
                        {appGroup.userArray?.find(
                          (groupUser) => groupUser.id === user.id
                        ) ? (
                          <Icon icon="mdi:user-remove-outline" width={20} />
                        ) : (
                          <Icon icon="mdi:user-add-outline" width={20} />
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

                      if (appUser && appUser.id === user.id) {
                        setAppUser(emptyUser);
                      }
                    }}
                  >
                    <Icon icon="mdi:delete-outline" width={20} />
                  </Button>
                </div>
              </div>
            ))}

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
    { staleTime: 360000, enabled: false }
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
        <Icon className="animate-spin" icon="mdi:loading" />
      ) : (
        <Icon icon="mdi:plus-thick" />
      )}
      create user
    </Button>
  );
};

export default Home;
