import { Open_Sans } from "next/font/google";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { trpc } from "@/util/trpc";

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
            route="/analysis"
            icon="icon-[mdi--google-analytics]"
          >
            Analysis
          </NavBtn>

          <NavBtn
            router={router}
            route="/connections"
            icon="icon-[mdi--account-group-outline]"
          >
            Connections
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
            onClickAsync={async (e) => {
              e.stopPropagation();
              if (appUser) router.push("/profile");
            }}
          >
            <div className="flex w-full items-center gap-x-2">
              <div className="flex rounded-full border-2 border-zinc-300 bg-zinc-800 p-1 sm:p-2">
                <span className="icon-[mdi--account] h-6 w-6 hover:text-zinc-100" />
              </div>

              <p className="hidden w-full items-center sm:block">
                {appUser && appUser.id.slice(0, 8)}
              </p>
            </div>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
