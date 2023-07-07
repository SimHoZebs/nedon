import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { useStoreActions, useStoreState } from "../lib/util/store";
import NegativeBtn from "../lib/comp/Button/NegativeBtn";
import addUserIcon from "../public/add-user.svg";
import Image from "next/image";
import { emptyUser } from "../lib/util/user";
import deleteIcon from "../public/delete.svg";
import { useRouter } from "next/router";
import { Icon } from "@iconify-icon/react";
import PrimaryBtn from "../lib/comp/Button/PrimaryBtn";
import Button from "../lib/comp/Button";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const server = trpc.useContext();
  const [userIdArray, setUserIdArray] = useState<string[]>([]);

  const allUsers = trpc.user.getAll.useQuery(userIdArray, {
    staleTime: 60 * 60,
  });
  const deleteUser = trpc.user.delete.useMutation();
  const deleteGroup = trpc.group.delete.useMutation();

  const { appUser, appGroup } = useStoreState((state) => state);
  const { setAppUser: setAppUser, setAppGroup } = useStoreActions(
    (actions) => actions
  );

  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();

  useEffect(() => {
    const userIdArray = localStorage.getItem("userIdArray");

    if (userIdArray) setUserIdArray(userIdArray.split(","));
  }, []);

  return (
    <section className="flex h-full w-full flex-col items-center justify-center gap-y-3">
      {allUsers.isLoading && <h1 className="text-3xl">Loading...</h1>}

      {allUsers.data && (
        <>
          <h1 className="text-3xl">Choose an account</h1>

          <div className="flex flex-col items-center rounded-md border border-zinc-600 sm:w-2/3">
            {allUsers.data.map((user) => (
              <div
                key={user.id}
                className="flex w-full justify-between gap-y-2 border-b border-zinc-600 p-3 hover:cursor-pointer"
                onClick={async (e) => {
                  // const isPaymentInit = user.products.includes(
                  //   Products.PaymentInitiation
                  // );
                  // setIsPaymentInitiation(isPaymentInit);

                  setAppUser((prev) => user);

                  if (!user.groupArray) return;
                  const group = await server.group.get.fetch({
                    id: user.groupArray[0].id,
                  });

                  if (!group) return;
                  setAppGroup((prev) => group);
                  router.push("/home");
                }}
              >
                <div className="flex flex-col">
                  <p>userId: {user.id}</p>
                  <p>
                    hasAccessToken: {user.hasAccessToken ? "true" : "false"}
                  </p>
                </div>

                <div className="flex h-full min-w-fit items-center">
                  {appUser && appUser.id !== user.id && appGroup && (
                    <PrimaryBtn
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
                        <Icon icon={"mdi:delete-outline"} width={24} />
                      ) : (
                        <Image
                          src={addUserIcon}
                          height={24}
                          width={24}
                          alt=""
                        />
                      )}
                    </PrimaryBtn>
                  )}

                  <NegativeBtn
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!user.groupArray) return;
                      await deleteGroup.mutateAsync({
                        id: user.groupArray[0].id,
                      });
                      await deleteUser.mutateAsync(user.id);
                      allUsers.refetch();
                      if (appUser && appUser.id === user.id) {
                        setAppUser(() => emptyUser);
                      }
                    }}
                  >
                    <Image src={deleteIcon} height={16} alt="" />
                  </NegativeBtn>
                </div>
              </div>
            ))}

            <CreateUserBtn userIdArray={userIdArray} />
          </div>
        </>
      )}
    </section>
  );
};

interface Props {
  userIdArray: string[];
}

const CreateUserBtn = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(props.userIdArray, {
    enabled: false,
  });
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
      className="flex w-full items-center justify-center gap-x-2 rounded-none rounded-b-md text-xl"
      onClick={async (e) => {
        setLoading(true);
        e.stopPropagation();
        const user = await createUser.mutateAsync();
        await createGroup.mutateAsync({ id: user.id });

        const publicToken = await sandboxPublicToken.refetch();
        if (!publicToken.data) throw new Error("no public token");

        await setAccessToken.mutateAsync({
          publicToken: publicToken.data,
          id: user.id,
        });

        const userIdArray = localStorage.getItem("userIdArray");
        localStorage.setItem(
          "userIdArray",
          userIdArray ? `${userIdArray},${user.id}` : user.id
        );

        const userArray = await allUsers.refetch();
        localStorage.setItem(
          "userIdArray",
          userArray.data ? userArray.data.join(",") : ""
        );
        setLoading(false);
      }}
    >
      create new user
      {loading && <Icon className="animate-spin" icon="mdi:loading" />}
    </Button>
  );
};

export default Home;
