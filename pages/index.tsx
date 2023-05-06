import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Button from "../lib/comp/Button";
import { UserClientSide } from "../lib/util/types";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const allUsers = trpc.account.getAll.useQuery(undefined);
  const createLinkToken = trpc.createLinkToken.useQuery(undefined, {
    enabled: false,
  });
  const createUser = trpc.account.create.useQuery(undefined, {
    enabled: false,
  });
  const server = trpc.useContext();
  const router = useRouter();

  const { user: globalUser } = useStoreState((state) => state);
  const { setProducts, setLinkToken, setIsPaymentInitiation, setUser } =
    useStoreActions((actions) => actions);

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
    <main className="flex flex-col p-3 gap-3">
      <Button
        onClick={async () => {
          const user = await createUser.refetch();
          if (user.error || !user.data) {
            console.log(user.error);
            return;
          }

          server.group.create.fetch({ id: user.data.id });
        }}
      >
        create new user
      </Button>

      <h3 className="text-2xl">Available users</h3>
      {allUsers.data &&
        allUsers.data.map((user) => (
          <section key={user.id} className="flex flex-col gap-y-2">
            <p>id: {user.id}</p>
            <p>PUBLIC_TOKEN: {user.PUBLIC_TOKEN}</p>
            <p>group Id array: {JSON.stringify(user.groupArray)}</p>

            <Button
              disabled={user.id === globalUser.id}
              onClick={async () => {
                const { ACCESS_TOKEN, ...rest } = user;

                const info = await server.info.fetch(user.id);
                if (!info) {
                  console.log(`info with user id ${user.id} not found`);
                  return;
                }

                const isPaymentInit = info.products.includes(
                  Products.PaymentInitiation
                );
                setIsPaymentInitiation(isPaymentInit);

                setProducts(info.products);

                const userClientSide: UserClientSide = {
                  hasAccessToken: ACCESS_TOKEN ? true : false,
                  ...rest,
                };
                setUser((prev) => userClientSide);

                setupLink();
                router.push("/user");
              }}
            >
              Log in as this user
            </Button>
            <Button onClick={() => {}}>Add this user to group</Button>
          </section>
        ))}
    </main>
  );
};

export default Home;
