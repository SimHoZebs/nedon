import React from "react";
import Button from "./Button";
import home from "../../public/home-line.svg";
import Image from "next/image";
import { useRouter } from "next/router";

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();

  return (
    <main>
      <Button onClick={() => router.push("../")}>
        <Image src={home} width={32} height={32} alt="Home button" />
      </Button>
      <div>{props.children}</div>
    </main>
  );
};

export default Layout;
