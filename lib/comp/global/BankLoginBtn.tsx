import { Button } from "@/comp/shared/Button";

import { trpc } from "@/util/trpc";

import { createId } from "@paralleldrive/cuid2";
import { useLocalStore } from "lib/store/localStore";

const BankLoginBtn = () => {
  const saveUserIdOnLocalStorage = useLocalStore((state) => state.setUserId);
  const createUser = trpc.user.create.useMutation();
  const queryClient = trpc.useUtils();

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
      saveUserIdOnLocalStorage(user.id);

      await queryClient.invalidate();
    } catch (error) {
      console.error("Error during creating user:", error);
      throw error;
    }
  };

  return <Button onClickAsync={handleClick}>Create profile</Button>;
};
export default BankLoginBtn;
