import React from "react";
import Button from "./Button";
import { useRouter } from "next/router";
import { useStoreActions, useStoreState } from "../util/store";

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
      className={`flex h-screen w-screen flex-col-reverse bg-zinc-950 text-zinc-300 sm:flex-row
      ${noto_sans.variable} font-sans font-normal`}
    >
      <nav className="flex h-20 w-full justify-between bg-zinc-900 p-2 pb-20 sm:h-full sm:w-56 sm:flex-col">
        <div className="flex items-start gap-y-2 sm:flex-col ">
          <NavButton router={router} route="/user">
            Home
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
