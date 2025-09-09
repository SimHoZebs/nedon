import { trpc } from "@/util/trpc";

import { ActionBtn } from "../../shared/Button";

import { useState } from "react";

const CreateUserBtn = () => {
  const createUser = trpc.user.create.useMutation();
  const updateUser = trpc.user.updateName.useMutation();
  const queryClient = trpc.useUtils();

  const sandboxPublicToken = trpc.plaid.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const setAccessToken = trpc.plaid.setAccessToken.useMutation();
  const [loading, setLoading] = useState(false);

  return (
    <ActionBtn
      onClickAsync={async (e) => {
        setLoading(true);
        e.stopPropagation();
        const user = await createUser.mutateAsync();
        await updateUser.mutateAsync({ ...user, name: user.id.slice(0, 8) });

        const publicToken = await sandboxPublicToken.refetch();
        if (!publicToken.data) throw new Error("no public token");

        await setAccessToken.mutateAsync({
          publicToken: publicToken.data,
          id: user.id,
        });

        queryClient.dev.getAllUsers.invalidate();
        setLoading(false);
      }}
    >
      {loading ? (
        <div className="flex h-4 w-4">
          <span className="icon-[mdi--loading] h-4 w-4 animate-spin" />
        </div>
      ) : (
        <div className="flex h-4 w-4">
          <span className="icon-[mdi--plus-thick] h-4 w-4" />
        </div>
      )}
      create user
    </ActionBtn>
  );
};

export default CreateUserBtn;
