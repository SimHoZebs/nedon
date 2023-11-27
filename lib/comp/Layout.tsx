import { Open_Sans } from "next/font/google";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { trpc } from "@/util/trpc";

import { useStore } from "../util/store";
import { ActionBtn, Button, NavBtn } from "./Button";

const customFont = Open_Sans({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-custom",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  useEffect(() => {
    if (!appUser && router.pathname !== "/") {
      console.debug(
        "Pushing to basePath. User is on path:" +
          router.pathname +
          " but did not log in.",
      );

      router.push("/");
    }
  }, [appUser, router]);

  return (
    <div
      className={`flex h-[100dvh] w-[100dvw] flex-col bg-zinc-900 text-sm font-medium text-zinc-300 sm:flex-row sm:text-base
      ${customFont.variable} font-sans`}
    >
      <main className="no-scrollbar h-full w-full overflow-auto px-5 py-3">
        {props.children}
      </main>
      {appUser && (
        <nav className="flex h-20 w-full gap-y-2 bg-zinc-800 p-2 px-5 sm:h-full sm:w-56 sm:flex-col sm:justify-between sm:px-2 ">
          <div className="flex w-full items-center justify-center gap-3 sm:flex-col">
            <NavBtn
              router={router}
              route="/"
              icon="icon-[mdi--home-variant-outline]"
            >
              Home
            </NavBtn>

            <NavBtn
              router={router}
              route="/transactions"
              icon="icon-[mdi--swap-horizontal]"
            >
              Transactions
            </NavBtn>

            <NavBtn
              router={router}
              route="/analysis"
              icon="icon-[mdi--google-analytics]"
            >
              Analysis
            </NavBtn>

            <div className="sm:w-full">
              <ActionBtn onClick={() => router.push("/user")}>
                <div className="flex items-center gap-x-2">
                  <span className="icon-[mdi--user-add-outline] h-6 w-6" />
                  <p>Add friend</p>
                </div>
              </ActionBtn>
            </div>
          </div>

          <div className="flex sm:w-full">
            <Button
              className="w-full gap-x-1 pr-3 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={() => router.push("/profile")}
            >
              <div className="flex w-full items-center gap-x-2">
                <div className="flex rounded-full border-2 border-zinc-300 bg-zinc-800 p-1 sm:p-2">
                  <span className="icon-[mdi--account] h-6 w-6 hover:text-zinc-100" />
                </div>

                <p className="hidden w-full items-center sm:block">
                  {appUser?.id.slice(0, 8)}
                </p>
              </div>
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
