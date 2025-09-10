import { useLocalStore, useLocalStoreDelay } from "@/util/localStore";

import { trpc } from "../util/trpc";

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

  console.debug("useAppUser - userIdFromLocalStorage:", userIdFromLocalStorage);

  const getUser = trpc.user.get.useQuery(
    { id: userIdFromLocalStorage || "" },
    {
      staleTime: Number.POSITIVE_INFINITY,
      enabled: !!userIdFromLocalStorage,
    },
  );

  const getFirstUser = trpc.dev.getFirstUser.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
    // Only run this query if we've confirmed there's no user ID in local storage
    // (it's null, not undefined which means it's still loading).
    enabled: userIdFromLocalStorage === null,
  });

  const user = getUser.data?.ok
    ? getUser.data.value
    : getFirstUser.data?.ok
      ? getFirstUser.data.value
      : null;

  const isLoading =
    userIdFromLocalStorage === undefined ||
    getUser.isLoading ||
    getFirstUser.isLoading;

  return { user, isLoading };
};

export default useAppUser;
