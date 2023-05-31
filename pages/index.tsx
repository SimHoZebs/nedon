import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Button from "../lib/comp/Button";
import { GroupClientSide, UserClientSide } from "../lib/util/types";
import addUserIcon from "../public/add-user.svg";
import removeUserIcon from "../public/remove-user.svg";
import Image from "next/image";
import { emptyUser } from "../lib/util/user";
import deleteIcon from "../public/delete.svg";

const Home: NextPage = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined);
  const createLinkToken = trpc.createLinkToken.useQuery(undefined, {
    enabled: false,
  });
  const createUser = trpc.user.create.useMutation();
  const server = trpc.useContext();
  const deleteUser = trpc.user.delete.useMutation();
  const createGroup = trpc.group.create.useMutation();

  const { user: appUser, currentGroup } = useStoreState((state) => state);
  const {
    setProducts,
    setLinkToken,
    setIsPaymentInitiation,
    setUser: setAppuser,
    setCurrentGroup,
  } = useStoreActions((actions) => actions);

  const addUserToGroup = trpc.group.addUser.useMutation();

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
    <section className="flex h-full w-full flex-col items-center justify-center gap-y-3">
      <h1 className="text-3xl">Choose an account</h1>

      <div className="flex w-2/3 flex-col items-center rounded-md border border-zinc-600">
        {allUsers.data &&
          allUsers.data.map((user) => (
            <div
              key={user.id}
              className="flex w-full justify-between gap-y-2 border-b border-zinc-600 p-3 hover:cursor-pointer"
              onClick={async (e) => {
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

                setAppuser((prev) => user);

                setupLink();
              }}
            >
              <div>
                <p>userId: {user.id}</p>
                <p>hasAccessToken: {user.hasAccessToken ? "true" : "false"}</p>
              </div>

              <div className="flex flex-col gap-y-2">
                {appUser.id !== user.id && currentGroup && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      addUserToGroup.mutateAsync({
                        userId: appUser.id,
                        groupId: currentGroup.id,
                      });
                    }}
                  >
                    {user.friendArray?.find(
                      (friend) => friend.id === user.id
                    ) ? (
                      <Image
                        src={removeUserIcon}
                        height={24}
                        width={24}
                        alt=""
                      />
                    ) : (
                      <Image src={addUserIcon} height={24} width={24} alt="" />
                    )}
                  </Button>
                )}

                <Button
                  className="bg-red-800"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteUser.mutateAsync(user.id);
                    allUsers.refetch();
                    if (appUser.id === user.id) {
                      setAppuser(() => emptyUser);
                    }
                  }}
                >
                  <Image src={deleteIcon} height={24} width={24} alt="" />
                </Button>
              </div>
            </div>
          ))}

        <Button
          className="w-full rounded-none rounded-b-md text-xl"
          onClick={async (e) => {
            e.stopPropagation();
            const user = await createUser.mutateAsync();
            allUsers.refetch();

            const group = await createGroup.mutateAsync({ id: user.id });
            setCurrentGroup(() => group);
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
