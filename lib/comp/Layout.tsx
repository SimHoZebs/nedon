import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useStoreActions, useStoreState } from "../util/store";

import { Inter } from "next/font/google";
import NavBtn from "./Button/NavBtn";
import { Icon } from "@iconify-icon/react";
import Button from "./Button";

const noto_sans = Inter({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { appUser } = useStoreState((state) => state);
  const { setAppUser, setAppGroup } = useStoreActions((actions) => actions);

  useEffect(() => {
    if (!appUser && router.pathname !== "/") {
      console.log(
        "User is on path:" +
          router.pathname +
          " but did not log in. Sending to basePath."
      );

      router.push("/");
    }
  }, [appUser, router]);

  return (
    <div
      className={`flex h-[100dvh] w-[100dvw] flex-col-reverse bg-zinc-950 text-sm text-zinc-300 sm:flex-row sm:text-base
      ${noto_sans.variable} font-sans font-normal`}
    >
      {appUser && (
        <nav className="flex h-20 w-full items-center justify-between gap-y-2 bg-zinc-900 p-2 px-10 sm:h-full sm:w-56 sm:flex-col sm:justify-start sm:px-2 sm:pb-20">
          <div className="flex items-center gap-x-1">
            <Button
              className="hover:bg-zinc-800 hover:text-zinc-200"
              onClick={() => router.push("/profile")}
            >
              <div className="flex w-full items-center gap-x-2">
                <div className="flex rounded-full border-2 border-zinc-300 bg-zinc-800 p-1 sm:p-2">
                  <Icon
                    icon="mdi:account"
                    className="hover:text-zinc-100"
                    width={24}
                    height={24}
                  />
                </div>

                <p className="hidden sm:block">{appUser.id.slice(0, 8)}</p>
              </div>
            </Button>

            <button
              className="group flex p-2 hover:cursor-pointer"
              onClick={() => {
                router.push("/");
                setAppUser(() => undefined);
                setAppGroup(() => undefined);
              }}
            >
              <Icon
                className="text-zinc-600 group-hover:text-zinc-500"
                icon="mdi:logout"
                width={16}
              />
            </button>
          </div>

          <NavBtn router={router} route="/home" icon="mdi:home-variant-outline">
            Home
          </NavBtn>

          <NavBtn
            router={router}
            route="/transactions"
            icon="mdi:swap-horizontal"
          >
            Transactions
          </NavBtn>

          <NavBtn router={router} route="/analysis" icon="mdi:google-analytics">
            Analysis
          </NavBtn>
        </nav>
      )}

      <main className="h-full w-full overflow-auto px-5 py-3">
        {props.children}
      </main>
    </div>
  );
};

export default Layout;
