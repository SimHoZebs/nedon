import { Open_Sans } from "next/font/google";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";

import { ActionBtn, Button, NavBtn } from "./Button";

const customFont = Open_Sans({
  weight: "variable",
  subsets: ["latin"],
  variable: "--font-custom",
});

const Layout = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();

  const setScreenType = useStore((state) => state.setScreenType);
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });
  const createUser = trpc.user.create.useMutation();
  const createGroup = trpc.group.create.useMutation();
  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
  const queryClient = trpc.useUtils();

  const appUser = allUsers.data?.[0];

  useEffect(() => {
    const createUserWithPlaid = async () => {
      const user = await createUser.mutateAsync();
      await createGroup.mutateAsync({ id: user.id });

      if (createGroup.error) console.error(createGroup.error);

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
      createUser.isIdle &&
      createGroup.isIdle
    ) {
      console.log(
        "There are no users in db and none are being created at the moment; creating one...",
      );
      createUserWithPlaid();
    }
  }, [
    allUsers.isFetching,
    appUser,
    createGroup,
    createUser,
    queryClient.user.getAll,
    sandboxPublicToken,
    setAccessToken,
  ]);

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
      className={`flex h-[100dvh] w-[100dvw] flex-col bg-zinc-900 text-sm font-medium text-zinc-300 sm:flex-row sm:text-base
      ${customFont.variable} font-sans`}
    >
      <main className="no-scrollbar h-full w-full overflow-auto px-5 py-3">
        {props.children}
      </main>
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

        <div className="flex sm:w-full">
          <div className="flex w-full items-center justify-center gap-x-2">
            <div className="flex rounded-full border-2 border-zinc-300 bg-zinc-800 p-1 sm:p-2">
              <span className="icon-[mdi--account] h-6 w-6 hover:text-zinc-100" />
            </div>

            <p className="hidden items-center sm:block">
              {appUser && appUser.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
