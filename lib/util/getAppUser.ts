
import { trpc } from './trpc';

const getAppUser = () => {

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  return { appUser, allUsers };
};

export default getAppUser;
