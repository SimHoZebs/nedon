import { Button } from "@/comp/shared/Button";

import { trpc } from "@/util/trpc";

import type { UnAuthUserClientSide } from "@/types/user";

import { createId } from "@paralleldrive/cuid2";
import { useLocalStore } from "lib/store/localStore";

const BankLoginBtn = () => {
  const saveUserIdOnLocalStorage = useLocalStore((state) => state.setUserId);
  const createUser = trpc.user.create.useMutation();
  const connectToBank = trpc.user.connectToBank.useMutation();
  const queryClient = trpc.useUtils();

  const connectUnAuthUserToBank = async (user: UnAuthUserClientSide) => {
    console.log("User has no access token, connecting to Bank...");

    const connectToBankResult = await connectToBank.mutateAsync({
      id: user.id,
    });
    if (!connectToBankResult.ok) {
      console.error("Failed to connect to Bank:", connectToBankResult.error);
      return;
    }

    console.log("Connected to Bank successfully");
    await queryClient.user.get.invalidate();
    console.log("Invalidated user query");
  };

  const handleClick = async () => {
    try {
      const id = createId();
      console.debug("Creating user with id:", id, "and name:", id.slice(0, 6));
      const createUserResult = await createUser.mutateAsync({
        name: id.slice(0, 6),
        id,
      });
      if (!createUserResult.ok) {
        throw new Error(JSON.stringify(createUserResult.error));
      }
      const user = createUserResult.value;
      connectUnAuthUserToBank(user);

      saveUserIdOnLocalStorage(user.id);

      await connectToBank.mutateAsync({ id: user.id });

      await queryClient.invalidate();
    } catch (error) {
      console.error("Error during creating user:", error);
      throw error;
    }
  };

  return <Button onClickAsync={handleClick}>Connect to Bank</Button>;
};
export default BankLoginBtn;
