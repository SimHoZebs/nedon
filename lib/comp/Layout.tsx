import React from "react";
import Button from "./Button";
import home from "../../public/home-line.svg";
import { useRouter } from "next/router";
import { useStoreState } from "../util/store";
import Image from "next/image";

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { user, currentGroup } = useStoreState((state) => state);

  return (
    <div className="flex bg-zinc-950 text-zinc-300 w-screen h-screen">
      <nav className="p-2 flex flex-col gap-y-2 items-start bg-zinc-900 w-56">
        <Button onClick={() => router.push("/")}>user selection screen</Button>
        <Button onClick={() => router.push("/user")}>
          <Image src={home} width={24} height={24} alt="home button" />
        </Button>
        <Button onClick={() => router.push("/transactions")}>
          Transactions
        </Button>

        <div>Current user: {user ? user.id.slice(0, 8) : "none"}</div>

        <div>
          Current group: {currentGroup ? currentGroup.id.slice(0, 8) : "none"}
        </div>
      </nav>
      <main className="w-full overflow-auto px-5 py-3">{props.children}</main>
    </div>
  );
};

export default Layout;
