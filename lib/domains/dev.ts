import { trpc } from "@/util/trpc";
import useAppUser from "lib/hooks/useAppUser";
import { useLocalStore } from "@/util/localStore";
import { useEffect } from "react";

export const useAutoCreateUser = () => {
  const queryClient = trpc.useUtils();
  const { user: appUser, isLoading: appUserIsLoading } = useAppUser();
  const saveUserIdOnLocalStorage = useLocalStore((state) => state.setUserId);
  const createUser = trpc.user.create.useMutation();

  useEffect(() => {
    const autoCreateUsers = async () => {
      const createUserResponse = await createUser.mutateAsync();
      if (!createUserResponse.ok) {
        console.error("Failed to create user:", createUserResponse.error);
        return;
      }
      const user = createUserResponse.value;

      saveUserIdOnLocalStorage(user.id);

      await queryClient.user.invalidate();
      console.log("User created with Plaid");
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
  ]);
};
