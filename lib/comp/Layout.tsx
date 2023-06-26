import React from "react";
import Button from "./Button";
import home from "../../public/home-line.svg";
import { useRouter } from "next/router";
import { useStoreActions, useStoreState } from "../util/store";
import Image from "next/image";

import { Inter } from "next/font/google";
import { emptyUser } from "../util/user";

const noto_sans = Inter({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { appUser, appGroup } = useStoreState((state) => state);
  const { setAppUser, setAppGroup } = useStoreActions((actions) => actions);

  return (
    <div
      className={`flex h-screen w-screen bg-zinc-950 text-zinc-300 
      ${noto_sans.variable} font-sans font-normal`}
    >
      <nav className="flex w-56 flex-col justify-between bg-zinc-900 p-2 pb-20">
        <div className="flex flex-col items-start gap-y-2 ">
          <Button onClick={() => router.push("/")}>
            user selection screen
          </Button>
          <Button onClick={() => router.push("/user")}>
            <Image src={home} width={24} height={24} alt="home button" />
          </Button>
          <Button onClick={() => router.push("/transactions")}>
            Transactions
          </Button>
          <Button onClick={() => router.push("/analysis")}>Analysis</Button>

          <div>Current user: {appUser ? appUser.id.slice(0, 8) : "none"}</div>

          <div>
            Current group: {appGroup ? appGroup.id.slice(0, 8) : "none"}
          </div>
          <div>
            Current group members:{" "}
            {appGroup?.userArray
              ? appGroup.userArray.map((user) => user.id.slice(0, 8)).join(", ")
              : "none"}
          </div>
        </div>

        <div>
          <Button
            onClick={() => {
              setAppUser(() => emptyUser);
              setAppGroup(() => undefined);
              router.push("/");
            }}
          >
            Logout
          </Button>
        </div>
      </nav>
      <main className="w-full overflow-auto px-5 py-3">{props.children}</main>
    </div>
  );
};

export default Layout;
