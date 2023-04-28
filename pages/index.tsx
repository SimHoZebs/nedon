import type { NextPage } from 'next'
import { trpc } from "../lib/util/trpc";
import { useCallback, useEffect, useState } from "react";
import { Products } from "plaid";
import { useStoreActions, useStoreState } from "../lib/util/store";
import Header from "../lib/comp/Header";
import ProductContainer from "../lib/comp/Products";
import Items from "../lib/comp/Items";

const Home: NextPage = () => {
  const hello = trpc.hello.useQuery({ text: "client" });
  const server = trpc.useContext();

  const { isPaymentInitiation, isItemAccess, linkSuccess } = useStoreState(
    (state) => state
  );
  const { setProducts, setLinkToken, setIsPaymentInitiation } = useStoreActions(
    (actions) => actions
  );

  const getInfo = useCallback(async () => {
    try {
      console.log("getInfo");

      const response = await server.info.fetch();
      const paymentInitiation = response.products.includes(
        Products.PaymentInitiation
      );

      setProducts(response.products);
      setIsPaymentInitiation(paymentInitiation);

      console.log("getInfo complete", response);
      return { paymentInitiation };
    } catch (error) {
      console.log(error);
    }
  }, [server.info, setIsPaymentInitiation, setProducts]);

  const createLinkToken = useCallback(async () => {
    try {
      const linkToken = await server.createLinkToken.fetch();
      console.log("createLinkeToken", linkToken);

      setLinkToken(linkToken);
      localStorage.setItem("link_token", linkToken);
    } catch (error) {
      setLinkToken(null);
      console.log(error);
    }
  }, [server.createLinkToken, setLinkToken]);

  useEffect(() => {
    const init = async () => {
      const paymentInitation = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        setLinkToken(localStorage.getItem("link_token"));
        return;
      }
      createLinkToken();
    };
    init();
  }, []);

  return (
    <div>
      <div>
        <Header />
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
    </div>
  );
};

export default Home
