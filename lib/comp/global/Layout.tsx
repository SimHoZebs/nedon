import { trpc } from "@/util/trpc";

import { NavBtn } from "./NavBtn";
import SandboxLoginBtn from "./SandboxLoginBtn";

import { organizeTxByTime, useTxGetAll } from "lib/domain/tx";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useStore } from "lib/store/store";
import { Inter } from "next/font/google";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useRef } from "react";

const font = Inter({ subsets: ["latin"] });

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const isDev = process.env.NODE_ENV === "development";
  const router = useRouter();
  const { user: appUser, isLoading: appUserLoading } = useAutoLoadUser();

  const txGetAllRetryCount = useRef(0);
  const setScreenType = useStore((state) => state.setScreenType);
  const setTxOragnizedByTimeArray = useStore(
    (state) => state.setTxOrganizedByTimeArray,
  );
  const txGetAll = useTxGetAll();

  const queryClient = trpc.useUtils();

  useEffect(() => {
    const loadTxArray = async () => {
      if (!appUser?.hasAccessToken) {
        console.log("No access token, skipping tx fetch");
        return;
      }
      if (txGetAll.status !== "success") {
        console.log("txGetAll not successful, skipping tx fetch");
        return;
      }
      if (!txGetAll.data?.ok) {
        console.log("txGetAll data not ok, skipping tx fetch");
        return;
      }

      const txArray = txGetAll.data.value;

      //undefined cursor should should give user txs for sandbox accounts
      while (
        !appUser.cursor &&
        txGetAllRetryCount.current < 3 &&
        ((txArray && txArray.length < 1) || txArray === null)
      ) {
        console.log("No transactions found. Retrying...");

        await new Promise((resolve) => setTimeout(resolve, 1500));
        txGetAllRetryCount.current += 3;
        await queryClient.tx.getAll.invalidate();
      }

      if (txArray) {
        console.log("updating txOragnizedByTimeArray");
        const response = organizeTxByTime(txArray);
        setTxOragnizedByTimeArray(response);
      }
    };

    loadTxArray();
  }, [
    appUser,
    queryClient.tx.getAll,
    appUser?.cursor,
    setTxOragnizedByTimeArray,
    txGetAll,
  ]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    //it's not like users will constantly change screen type, but...
    const trackScreenType = () => {
      // throttle
      if (timeoutId) {
        return;
      }

      timeoutId = setTimeout(() => {
        const width = window.innerWidth;
        if (width < 640) {
          setScreenType("mobile");
        } else if (width < 768) {
          setScreenType("tablet");
        } else {
          setScreenType("desktop");
        }

        // Clear the timeout.
        timeoutId = null;
      }, 300);
    };

    window.addEventListener("resize", trackScreenType);

    return () => {
      window.removeEventListener("resize", trackScreenType);
    };
  }, [setScreenType]);

  return (
    <div
      className={`flex h-[100dvh] w-[100dvw] flex-col bg-zinc-900 ${font.className} font-sans text-sm text-zinc-300 sm:flex-row sm:text-base`}
    >
      {isDev && (
        <div className="absolute top-0 right-0 z-50 rounded-md bg-zinc-800 text-xs text-zinc-500">
          <NavBtn
            route="/dev"
            router={router}
            icon="icon-[mdi--bug]"
            className="p-0"
          />
        </div>
      )}
      <main className="no-scrollbar h-full w-full overflow-auto px-5 py-3">
        {props.children}
      </main>
      <nav className="flex h-20 w-full items-center gap-y-2 border-zinc-400 bg-zinc-900 px-5 py-0 sm:h-full sm:w-56 sm:flex-col sm:justify-between sm:border-l sm:px-0 sm:py-5">
        <div className="flex h-full w-full items-center justify-evenly sm:flex-col sm:justify-center">
          <NavBtn
            route="/"
            router={router}
            icon="icon-[mdi--home-variant-outline]"
          >
            <div className="hidden items-center sm:flex">Home</div>
          </NavBtn>

          <NavBtn
            route="/analytics"
            router={router}
            icon="icon-[mdi--google-analytics]"
          >
            <div className="hidden items-center sm:flex">Analytics</div>
          </NavBtn>

          <NavBtn
            route="/connections"
            router={router}
            icon="icon-[mdi--account-group-outline]"
          >
            <div className="hidden items-center sm:flex">Connections</div>
          </NavBtn>

          <NavBtn
            route="/settings"
            router={router}
            icon="icon-[mdi--cog-outline]"
          >
            <div className="hidden items-center sm:flex">Settings</div>
          </NavBtn>
        </div>

        {appUserLoading ? (
          <div className="flex justify-center text-xs text-zinc-500">
            Loading...
          </div>
        ) : appUser ? (
          <NavBtn router={router} route="/profile">
            <div className="flex h-6 items-center">
              <span className="icon-[mdi--account] h-6 w-6 lg:mr-4" />
              <p className="hidden w-full md:flex">{appUser.name}</p>
            </div>
          </NavBtn>
        ) : (
          <SandboxLoginBtn />
        )}
      </nav>
    </div>
  );
};

export default Layout;
