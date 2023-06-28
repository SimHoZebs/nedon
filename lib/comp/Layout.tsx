import React from "react";
import Button from "./Button";
import home from "../../public/home-line.svg";
import { useRouter } from "next/router";
import { useStoreActions, useStoreState } from "../util/store";
import Image from "next/image";

import { Inter } from "next/font/google";
import { emptyUser } from "../util/user";
import NavButton from "./NavButton";

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
        <div className="flex flex-col items-start gap-y-2">
          <NavButton router={router} route="/user">
            <Image src={home} width={24} height={24} alt="home button" />
          </NavButton>

          <NavButton router={router} route="/transactions">
            Transactions
          </NavButton>

          <NavButton router={router} route="/analysis">
            Analysis
          </NavButton>
        </div>

        {appUser && (
          <div>
            <div>userId: {appUser.id.slice(0, 8)}</div>
            <div>groupId: {appGroup ? appGroup.id.slice(0, 8) : "none"}</div>
            <div>
              group members:{" "}
              {appGroup?.userArray
                ? appGroup.userArray
                    .map((user) => user.id.slice(0, 8))
                    .join(", ")
                : "none"}
            </div>

            <div className="flex gap-x-2">
              <NavButton router={router} route="/Profile">
                Profile
              </NavButton>
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
          </div>
        )}
      </nav>
      <main className="w-full overflow-auto px-5 py-3">{props.children}</main>
    </div>
  );
};

export default Layout;
