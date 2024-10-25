import { Space_Grotesk } from "next/font/google";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect } from "react";

import getAppUser from "@/util/getAppUser";
import { useLocalStore, useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { organizeTxByTime } from "@/util/tx";

import { NavBtn } from "./Button";

const customFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-custom",
  weight: "variable",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const { appUser, allUsers } = getAppUser();

  const setUserId = useLocalStore((state) => state.setUserId);
  const setScreenType = useStore((state) => state.setScreenType);
  const txOragnizedByTimeArray = useStore(
    (state) => state.txOragnizedByTimeArray,
  );
  const setTxOragnizedByTimeArray = useStore(
    (state) => state.setTxOragnizedByTimeArray,
  );

  const createUser = trpc.user.create.useMutation();
  const updateUser = trpc.user.update.useMutation();
  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
  const queryClient = trpc.useUtils();

  useEffect(() => {
    const createUserWithPlaid = async () => {
      const user = await createUser.mutateAsync();
      setUserId(user.id);
      await updateUser.mutateAsync({ ...user, name: user.id.slice(0, 8) });

      const publicToken = await sandboxPublicToken.refetch();
      if (!publicToken.data) throw new Error("no public token");

      await setAccessToken.mutateAsync({
        publicToken: publicToken.data,
        id: user.id,
      });

      queryClient.user.getAll.invalidate();
    };

    if (
      !appUser &&
      !allUsers.isFetching &&
      !sandboxPublicToken.isFetching &&
      createUser.isIdle
    ) {
      console.log(
        "There are no users in db and none are being created at the moment; creating one...",
      );
      createUserWithPlaid();
    }
  }, [
    setUserId,
    allUsers.isFetching,
    appUser,
    createUser,
    queryClient.user.getAll,
    sandboxPublicToken,
    setAccessToken,
    updateUser,
  ]);

  useEffect(() => {
    if (txArray.data) {
      console.log("updating txOragnizedByTimeArray");
      const response = organizeTxByTime(txArray.data);
      setTxOragnizedByTimeArray(response);
    }
  }, [txArray.data, setTxOragnizedByTimeArray]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    //it's not like users will constantly change screen type, but...
    const trackScreenType = (e: UIEvent) => {
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
      <nav className="flex h-20 w-full gap-y-2 border-l border-zinc-400 bg-zinc-900 p-5 sm:h-full sm:w-56 sm:flex-col sm:justify-between sm:px-0">
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
