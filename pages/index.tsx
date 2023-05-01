import type { NextPage } from "next";
import { trpc } from "../lib/util/trpc";
import { useCallback, useEffect, useState } from "react";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Header from "../lib/comp/Header";
import ProductContainer from "../lib/comp/Products";
import Items from "../lib/comp/Items";

const Home: NextPage = () => {
  const allUsers = trpc.account.getAll.useQuery(undefined);
  const createLinkToken = trpc.createLinkToken.useQuery(undefined, {
    enabled: false,
  });
  const createUser = trpc.account.create.useQuery(undefined, {
    enabled: false,
  });
  const server = trpc.useContext();

  const { isPaymentInitiation, isItemAccess, linkSuccess, user } =
    useStoreState((state) => state);
  const { setProducts, setLinkToken, setIsPaymentInitiation, setUser } =
    useStoreActions((actions) => actions);

  const getInfo = async () => {
    if (!user) {
      console.log("no user");
      return;
    }

    const info = await server.info.fetch(user.id);
    if (!info) {
      console.log("info with user id not found");
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
    console.log("createLinkeToken", linkToken);

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
      <button
        className="p-2 bg-blue-300 w-fit rounded-lg font-bold"
        onClick={async () => {
          const user = await createUser.refetch();
          if (user.error || !user.data) {
            console.log(user.error);
            return;
          }
        }}
      >
        create new user
      </button>

      {allUsers.data &&
        allUsers.data.map((user) => (
          <div key={user.id}>
            <p>id: {user.id}</p>
            <p>ACCESS_TOKEN: {user.ACCESS_TOKEN}</p>
            <p>PUBLIC_TOKEN: {user.PUBLIC_TOKEN}</p>
            <button
              className="p-2 bg-blue-300 w-fit rounded-lg"
              onClick={async () => {
                setUser(user);
                const paymentInitation = await getInfo(); // used to determine which path to take when generating token
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
            </button>
          </div>
        ))}
      {linkSuccess && (
        <>
          {isPaymentInitiation && <ProductContainer />}
          {isItemAccess && (
            <>
              <ProductContainer />
              <Items />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
