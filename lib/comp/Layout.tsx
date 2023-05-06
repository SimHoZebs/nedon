import React from "react";
import Button from "./Button";
import home from "../../public/home-line.svg";
import { useRouter } from "next/router";
import { useStoreState } from "../util/store";
import Image from "next/image";

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { user } = useStoreState((state) => state);

  return (
    <div className="flex bg-zinc-950 text-zinc-300 w-screen h-screen">
      <nav className="p-1 flex flex-col gap-y-2 items-start h-full bg-zinc-900 w-56">
        <Button onClick={() => router.push("/")}>user selection screen</Button>
        <Button onClick={() => router.push("/user")}>
          <Image src={home} width={24} height={24} alt="home button" />
        </Button>

        <div>Current user: {user ? user.id.slice(0, 8) : "none"}</div>
      </nav>
      {props.children}
    </div>
  );
};

export default Layout;
