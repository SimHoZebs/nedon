import type { NextPage } from 'next'
import { trpc } from "../util/trpc";
import { useEffect, useState } from "react";
import { Products } from "plaid";

const Home: NextPage = () => {
  const hello = trpc.hello.useQuery({ text: "client" });
  const [linkSuccess, setLinkSuccess] = useState(false);
  const server = trpc.useContext();
  const [linkToken, setLinkToken] = useState<string | null>("");
  const [products, setProducts] = useState<string[]>([]);
  const [isPaymentInitiation, setIsPaymentInitiation] = useState(false);

  const getInfo = async () => {
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
  };

  const createLinkToken = async () => {
    try {
      const linkToken = await server.createLinkToken.fetch();
      console.log("createLinkeToken", linkToken);

      setLinkToken(linkToken);
      localStorage.setItem("link_token", linkToken);
    } catch (error) {
      setLinkToken(null);
      console.log(error);
    }
  };

  useEffect(() => {
    const init = async () => {};
    init();
  }, []);

  return (
    <div>
      {hello.data ? <p>{hello.data.greeting}</p> : <div>Loading...</div>}
      <div>Step 1</div>
      <button onClick={getInfo}>getInfo</button>
      <div>Step 2</div>
      <button onClick={createLinkToken}>createLinkToken</button>
    </div>
  );
};

export default Home
