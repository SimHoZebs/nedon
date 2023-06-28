import React from "react";
import { useStoreState } from "../lib/util/store";
import Button from "../lib/comp/Button";

const Page = () => {
  const { appUser } = useStoreState((state) => state);

  return (
    <section className="w-full">
      <div>{appUser?.name}</div>
      <Button>Modify</Button>
    </section>
  );
};

export default Page;
