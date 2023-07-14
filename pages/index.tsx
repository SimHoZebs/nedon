import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { useStoreActions, useStoreState } from "../lib/util/store";
import { emptyUser } from "../lib/util/user";
import { useRouter } from "next/router";
import { Icon } from "@iconify-icon/react";
import Button from "../lib/comp/Button";
import { useEffect, useState } from "react";
import H1 from "../lib/comp/H1";

const Home: NextPage = () => {
  const router = useRouter();
  const server = trpc.useContext();
  const [userIdArray, setUserIdArray] = useState<string[]>([]);
  const allUsers = trpc.user.getAll.useQuery(userIdArray, {
    staleTime: Infinity,
  });

  useEffect(() => {
    const localStorageUserIdArray = localStorage.getItem("userIdArray");
    if (!localStorageUserIdArray) return;

    //initial load of browser with users
    console.log("syncing local state using local storage");

    setUserIdArray(() => localStorageUserIdArray.split(","));
  }, []);

  useEffect(() => {
    const refetchAllUsersAndSyncLocalStorage = async () => {
      console.log("refetching to sync local storage and local state");

      const userArray = await allUsers.refetch();
      if (!userArray.data) throw new Error("no data");

      const newUserIdArray = userArray.data.map((user) => user.id);
      setUserIdArray(() => newUserIdArray);
      localStorage.setItem("userIdArray", newUserIdArray.join(","));
    };

    if (
      userIdArray.length === 0 ||
      localStorage.getItem("userIdArray") === userIdArray.join(",")
    ) {
      console.log("local storage and local state are already synced");

      return;
    }

    console.log("syncing local storage using local state");

    localStorage.setItem("userIdArray", userIdArray.join(","));
    refetchAllUsersAndSyncLocalStorage();
  }, [allUsers, userIdArray]);

  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();

  const { appUser, appGroup } = useStoreState((state) => state);
  const { setAppUser: setAppUser, setAppGroup } = useStoreActions(
    (actions) => actions
  );

  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-y-3">
      <H1>
        {allUsers.isLoading
          ? "Loading available accounts...."
          : "Choose an account"}
      </H1>

      {allUsers.data && !allUsers.isRefetching && (
        <div className="flex flex-col items-center rounded-md border border-zinc-600 ">
          {allUsers.data.map((user) => (
            <div
              key={user.id}
              className="flex w-full items-center justify-between border-b border-zinc-600 p-3 hover:cursor-pointer sm:gap-x-16"
              onClick={async (e) => {
                setAppUser((prev) => user);

                if (!user.groupArray) return;
                const group = await server.group.get.fetch({
                  id: user.groupArray[0].id,
                });

                if (!group) return;
                setAppGroup((prev) => group);
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
                          ? "text-pink-300"
                          : "text-blue-300"
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

                        setAppGroup((prev) => updatedAppGroup);
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
                  className="text-pink-300"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!user.groupArray) return;
                    await deleteGroup.mutateAsync({
                      id: user.groupArray[0].id,
                    });
                    await deleteUser.mutateAsync(user.id);
                    setUserIdArray((prev) =>
                      prev.filter((userId) => userId !== user.id)
                    );

                    if (appUser && appUser.id === user.id) {
                      setAppUser(() => emptyUser);
                    }
                  }}
                >
                  <Icon icon="mdi:delete-outline" width={20} />
                </Button>
              </div>
            </div>
          ))}

          <CreateUserBtn setUserIdArray={setUserIdArray} />
        </div>
      )}
    </section>
  );
};

interface Props {
  setUserIdArray: React.Dispatch<React.SetStateAction<string[]>>;
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
      className="flex w-full items-center justify-center gap-x-2 rounded-none rounded-b-md text-xl font-semibold"
      onClick={async (e) => {
        setLoading(true);
        e.stopPropagation();
        const user = await createUser.mutateAsync();
        await createGroup.mutateAsync({ id: user.id });

        const publicToken = await sandboxPublicToken.refetch();
        if (!publicToken.data) throw new Error("no public token");

        const userWithAccessToken = await setAccessToken.mutateAsync({
          publicToken: publicToken.data,
          id: user.id,
        });

        props.setUserIdArray((prev) => [...prev, userWithAccessToken.id]);
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
