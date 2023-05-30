import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Button from "../lib/comp/Button";
import { GroupClientSide, UserClientSide } from "../lib/util/types";
import addUser from "../public/add-user.svg";
import removeUser from "../public/remove-user.svg";
import Image from "next/image";

const Home: NextPage = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined);
  const createLinkToken = trpc.createLinkToken.useQuery(undefined, {
    enabled: false,
  });
  const createUser = trpc.user.create.useQuery(undefined, {
    enabled: false,
  });
  const server = trpc.useContext();

  const { user: globalUser, currentGroup } = useStoreState((state) => state);
  const {
    setProducts,
    setLinkToken,
    setIsPaymentInitiation,
    setUser,
    setCurrentGroup,
  } = useStoreActions((actions) => actions);

  const addUserToGroup = trpc.group.addUser.useMutation();
  const removeUserFromGroup = trpc.group.removeUser.useMutation();
  const addUserAsFriend = trpc.user.addFriend.useMutation();

  const setupLink = async () => {
    // used to determine which path to take when generating token
    // do not generate a new token for OAuth redirect; instead
    // setLinkToken from localStorage
    if (window.location.href.includes("?oauth_state_id=")) {
      setLinkToken(localStorage.getItem("link_token"));
      return;
    }

    const linkToken = await createLinkToken.refetch();
    console.log("new link token", linkToken.data);

    if (linkToken.error || !linkToken.data) {
      setLinkToken(null);
      console.log(linkToken.error);
      return;
    }

    setLinkToken(linkToken.data);
    localStorage.setItem("link_token", linkToken.data);
  };

  return (
    <section className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex w-2/3 flex-col items-center rounded-md border border-zinc-600">
        {allUsers.data &&
          allUsers.data.map((user) => (
            <div
              key={user.id}
              className="flex w-full justify-between gap-y-2 border-b border-zinc-600 p-3 hover:cursor-pointer"
              onClick={async () => {
                const info = await server.user.get.fetch(user.id);
                if (!info) {
                  console.log(`info with user id ${user.id} not found`);
                  return;
                }

                const isPaymentInit = info.products.includes(
                  Products.PaymentInitiation
                );
                setIsPaymentInitiation(isPaymentInit);

                setProducts(info.products);

                setUser((prev) => user);
                if (!user.groupArray || user.groupArray.length === 0) return;
                const firstGroup = user.groupArray[0];
                const currentGroup = await server.group.get.fetch({
                  id: firstGroup.id,
                });
                if (!currentGroup) return;

                setCurrentGroup((prev) => currentGroup);

                setupLink();
              }}
            >
              <div>
                <p>userId: {user.id}</p>
                <p>hasAccessToken: {user.hasAccessToken ? "true" : "false"}</p>
              </div>

              {currentGroup && (
                <Button
                  disabled={globalUser.id == user.id}
                  onClick={async (e) => {
                    e.stopPropagation();
                    const updatedGroup = userInGroup(user, currentGroup)
                      ? await removeUserFromGroup.mutateAsync({
                          userId: user.id,
                          groupId: currentGroup.id,
                        })
                      : await addUserToGroup.mutateAsync({
                          userId: user.id,
                          groupId: currentGroup.id,
                        });

                    setCurrentGroup((prev) => updatedGroup);
                  }}
                >
                  <Image
                    src={userInGroup(user, currentGroup) ? removeUser : addUser}
                    height={24}
                    width={24}
                    alt=""
                  />
                </Button>
              )}

              <Button
                onClick={() => {
                  addUserAsFriend.mutateAsync({
                    userId: globalUser.id,
                    friendId: user.id,
                  });
                }}
              >
                Add friend
              </Button>
            </div>
          ))}

        <Button
          className="w-full rounded-none rounded-b-md text-xl"
          onClick={async () => {
            const user = await createUser.refetch();
            allUsers.refetch();
            if (!user.data) {
              console.log(user.error);
              return;
            }

            server.group.create.fetch({ id: user.data.id });
          }}
        >
          create new user
        </Button>
      </div>
    </section>
  );
};

const userInGroup = (user: UserClientSide, currentGroup: GroupClientSide) => {
  if (!user.groupArray) return false;

  for (const group of user.groupArray) {
    if (group.id === currentGroup.id) {
      return true;
    }
  }
  return false;
};
export default Home;
