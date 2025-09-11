import { useLocalStore } from "@/util/localStore";
import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useEffect } from "react";

export const useAutoCreateUser = () => {
  const queryClient = trpc.useUtils();
  const { user: appUser, isLoading: appUserIsLoading } = useAutoLoadUser();
  const saveUserIdOnLocalStorage = useLocalStore((state) => state.setUserId);
  const createUser = trpc.user.create.useMutation();
  const connectToPlaid = trpc.user.connectToPlaid.useMutation();

  useEffect(() => {
    const autoCreateUsers = async () => {
      try {
        const createUserResult = await createUser.mutateAsync();
        if (!createUserResult.ok) {
          throw new Error(JSON.stringify(createUserResult.error));
        }
        const user = createUserResult.value;

        // for future sessions
        saveUserIdOnLocalStorage(user.id);

        await connectToPlaid.mutateAsync({ id: user.id });

        await queryClient.user.invalidate();
      } catch (error) {
        console.error("Error during auto-creating user:", error);
      }
    };

    if (!appUser && !appUserIsLoading && createUser.isIdle) {
      console.log(
        "There are no users in db and none are being created at the moment; creating one...",
      );
      autoCreateUsers();
    } else {
      if (appUserIsLoading) {
        console.log("appUser is loading...");
      }
      if (createUser.isPending) {
        console.log("appUser is being created...");
      }
      if (appUser) {
        console.log("appUser found:", appUser);
        saveUserIdOnLocalStorage(appUser.id);
      }
    }
  }, [
    saveUserIdOnLocalStorage,
    appUser,
    createUser,
    queryClient.user,
    appUserIsLoading,
    connectToPlaid,
  ]);
};
