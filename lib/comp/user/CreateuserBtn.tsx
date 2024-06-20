import { useState } from "react";

import { trpc } from "@/util/trpc";

import { ActionBtn } from "../Button";

const CreateUserBtn = () => {
  const createUser = trpc.user.create.useMutation();
  const updateUser = trpc.user.update.useMutation();
  const queryClient = trpc.useUtils();

  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
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

        queryClient.user.getAll.invalidate();
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
