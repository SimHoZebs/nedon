import { trpc } from "./trpc";

const getAppUser = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Number.POSITIVE_INFINITY,
  });

  const appUser = allUsers.data?.[0];

  return { appUser, allUsers };
};

export default getAppUser;
