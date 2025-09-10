import { useLocalStore, useLocalStoreDelay } from "@/util/localStore";

import { trpc } from "./trpc";

/**
 * Fetches the current application user. It first attempts to retrieve the user
 *  using the user ID stored in local storage. If no user ID is found or if the
 * user cannot be fetched, it falls back to fetching the first user in the
 * database (primarily for development purposes).
 */
const useAppUser = () => {
  const userIdFromLocalStorage = useLocalStoreDelay(
    useLocalStore,
    (state) => state.userId,
  );

  const getUser = trpc.user.get.useQuery(
    { id: userIdFromLocalStorage || "" },
    {
      staleTime: Number.POSITIVE_INFINITY,
    },
  );

  const getFirstUser = trpc.dev.getFirstUser.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  if (getUser.data?.ok) {
    return getUser.data.value;
  }
  if (getFirstUser.data?.ok) {
    return getFirstUser.data.value;
  }
  return null;
};

export default useAppUser;
