import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Header from "../lib/comp/Header";
import { User } from "@prisma/client";
import Button from "../lib/comp/Button";

const Home: NextPage = () => {
  const allUsers = trpc.account.getAll.useQuery(undefined);
  const createLinkToken = trpc.createLinkToken.useQuery(undefined, {
    enabled: false,
  });
  const createUser = trpc.account.create.useQuery(undefined, {
    enabled: false,
  });
  const server = trpc.useContext();

  const { user, accessToken } = useStoreState((state) => state);
  const { setProducts, setLinkToken, setIsPaymentInitiation, setUser } =
    useStoreActions((actions) => actions);

  const getInfo = async (user: User) => {
    if (!user) {
      console.log("no user");
      return;
    }

    const info = await server.info.fetch(user.id);
    if (!info) {
      console.log(`info with user id ${user.id} not found`);
      return;
    }

    const paymentInitiation = info.products.includes(
      Products.PaymentInitiation
    );

    setProducts(info.products);
    setIsPaymentInitiation(paymentInitiation);

    return { paymentInitiation };
  };

  const createToken = async () => {
    const linkToken = await createLinkToken.refetch();
    console.log("createLinkToken", linkToken);

    if (linkToken.error || !linkToken.data) {
      setLinkToken(null);
      console.log(linkToken.error);
      return;
    }

    setLinkToken(linkToken.data);
    localStorage.setItem("link_token", linkToken.data);
  };

  return (
    <div className="flex flex-col p-3">
      <div>Current user: {user ? user.id : "none"}</div>
      <Header />
      <Button
        onClick={async () => {
          const user = await createUser.refetch();
          if (user.error || !user.data) {
            console.log(user.error);
            return;
          }
        }}
      >
        create new user
      </Button>

      {allUsers.data &&
        allUsers.data.map((user) => (
          <div key={user.id}>
            <p>id: {user.id}</p>
            <p>ACCESS_TOKEN: {accessToken}</p>
            <p>PUBLIC_TOKEN: {user.PUBLIC_TOKEN}</p>
            <Button
              onClick={async () => {
                setUser(user);
                const paymentInitation = await getInfo(user); // used to determine which path to take when generating token
                // do not generate a new token for OAuth redirect; instead
                // setLinkToken from localStorage
                if (window.location.href.includes("?oauth_state_id=")) {
                  setLinkToken(localStorage.getItem("link_token"));
                  return;
                }
                createToken();
              }}
            >
              Test with this user
            </Button>
          </div>
        ))}
    </div>
  );
};

export default Home;
