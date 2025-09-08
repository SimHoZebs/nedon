import { useLocalStore, useLocalStoreDelay } from "@/util/localStore";

import type { UserClientSide } from "@/types/user";

import { trpc } from "./trpc";

const useAppUser = () => {
  const userId = useLocalStoreDelay(useLocalStore, (state) => state.userId);

  const user = trpc.user.get.useQuery(
    { id: userId || "" },
    {
      staleTime: Number.POSITIVE_INFINITY,
    },
  );

  const firstUser = trpc.dev.getFirstUser.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const appUser: UserClientSide | null | undefined = user.data
    ? user.data
    : firstUser.data;

  return appUser;
};

export default useAppUser;
