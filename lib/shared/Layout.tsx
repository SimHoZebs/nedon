import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { organizeTxByTime, useTxGetAll } from "@/util/tx";

import { NavBtn } from "./Button";

import { useAutoCreateUser } from "lib/domains/dev";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useRef } from "react";

const customFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-custom",
  weight: "variable",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { user: appUser } = useAutoLoadUser();

  const txGetAllRetryCount = useRef(0);
  const setScreenType = useStore((state) => state.setScreenType);
  const setTxOragnizedByTimeArray = useStore(
    (state) => state.setTxOrganizedByTimeArray,
  );
  const txGetAll = useTxGetAll();

  const connectToPlaid = trpc.user.connectToPlaid.useMutation();
  const queryClient = trpc.useUtils();

  useAutoCreateUser();

  // Only for development, this should be a manual link flow in production
  useEffect(() => {
    const connectUnAuthUserToPlaid = async () => {
      if (!appUser) return;
      if (appUser.hasAccessToken) return;
      console.log("User has no access token, connecting to Plaid...");

      const connectToPlaidResult = await connectToPlaid.mutateAsync({
        id: appUser.id,
      });
      if (!connectToPlaidResult.ok) {
        console.error(
          "Failed to connect to Plaid:",
          connectToPlaidResult.error,
        );
        return;
      }

      console.log("Connected to Plaid successfully");
      await queryClient.user.get.invalidate();
      console.log("Invalidated user query");
    };

    connectUnAuthUserToPlaid();
  }, [appUser, connectToPlaid.mutateAsync, queryClient.user.get.invalidate]);

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
      className={`flex h-[100dvh] w-[100dvw] flex-col bg-zinc-900 text-sm text-zinc-300 sm:flex-row sm:text-base ${customFont.variable} font-sans`}
    >
      <main className="no-scrollbar h-full w-full overflow-auto px-5 py-3">
        {props.children}
      </main>
      <nav className="flex h-20 w-full gap-y-2 border-zinc-400 border-l bg-zinc-900 p-5 sm:h-full sm:w-56 sm:flex-col sm:justify-between sm:px-0">
        <div className="flex w-full items-center justify-center sm:flex-col">
          <NavBtn
            router={router}
            route="/"
            icon="icon-[mdi--home-variant-outline]"
          >
            Home
          </NavBtn>

          <NavBtn
            router={router}
            route="/analytics"
            icon="icon-[mdi--google-analytics]"
          >
            Analytics
          </NavBtn>

          <NavBtn
            router={router}
            route="/connections"
            icon="icon-[mdi--account-group-outline]"
          >
            Connections
          </NavBtn>

          <NavBtn
            router={router}
            route="/settings"
            icon="icon-[mdi--cog-outline]"
          >
            Settings
          </NavBtn>
        </div>

        <NavBtn router={router} route="/profile">
          <span className="icon-[mdi--account] mr-4 h-6 w-6" />
          {appUser ? appUser.name : ""}
        </NavBtn>
      </nav>
    </div>
  );
};

export default Layout;
