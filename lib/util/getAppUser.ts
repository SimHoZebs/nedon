import { useLocalStore, useLocalStoreDelay } from "@/util/store";
import { trpc } from "./trpc";

const getAppUser = () => {
  const userId = useLocalStoreDelay(useLocalStore, (state) => state.userId);

  const user = trpc.user.get.useQuery(userId || "", {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const appUser = user.data ? user.data : allUsers.data?.[0];

  return { appUser, allUsers };
};

export default getAppUser;
