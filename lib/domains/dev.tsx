import { useLocalStore } from "@/util/localStore";
import { Button } from "lib/shared/Button";
import { trpc } from "@/util/trpc";
import { createId } from "@paralleldrive/cuid2";
import { UnAuthUserClientSide } from "@/types/user";

export const SandboxLoginButton = () => {
  const saveUserIdOnLocalStorage = useLocalStore((state) => state.setUserId);
  const createUser = trpc.user.create.useMutation();
  const connectToPlaid = trpc.user.connectToPlaid.useMutation();
  const queryClient = trpc.useUtils();

  const connectUnAuthUserToPlaid = async (user: UnAuthUserClientSide) => {
    console.log("User has no access token, connecting to Plaid...");

    const connectToPlaidResult = await connectToPlaid.mutateAsync({
      id: user.id,
    });
    if (!connectToPlaidResult.ok) {
      console.error("Failed to connect to Plaid:", connectToPlaidResult.error);
      return;
    }

    console.log("Connected to Plaid successfully");
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
      connectUnAuthUserToPlaid(user);

      saveUserIdOnLocalStorage(user.id);

      await connectToPlaid.mutateAsync({ id: user.id });

      await queryClient.invalidate();
    } catch (error) {
      console.error("Error during creating user:", error);
      throw error;
    }
  };

  return <Button onClickAsync={handleClick}>Connect to Plaid Sandbox</Button>;
};
