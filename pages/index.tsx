import type { NextPage } from 'next'
import { trpc } from "../util/trpc";
import { useState } from "react";

const Home: NextPage = () => {
  const hello = trpc.hello.useQuery({ text: "client" });
  const [linkSuccess, setLinkSuccess] = useState(false);

  if (!hello.data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <p>{hello.data.greeting}</p>
      <button></button>
    </div>
  );
};

export default Home
