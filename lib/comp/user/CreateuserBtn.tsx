import { useState } from "react";

import { trpc } from "@/util/trpc";

import { Button } from "../Button";

const CreateUserBtn = () => {
  const createUser = trpc.user.create.useMutation();
  const createGroup = trpc.group.create.useMutation();
  const queryClient = trpc.useContext();

  const sandboxPublicToken = trpc.sandBoxAccess.useQuery(
    { instituteID: undefined },
    { staleTime: 360000, enabled: false },
  );
  const setAccessToken = trpc.setAccessToken.useMutation();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="flex w-full items-center justify-center gap-x-2 rounded-none rounded-b-md text-xl font-semibold hover:bg-zinc-800 hover:text-zinc-200"
      onClick={async (e) => {
        setLoading(true);
        e.stopPropagation();
        const user = await createUser.mutateAsync();
        await createGroup.mutateAsync({ id: user.id });
        if (createGroup.error) console.error(createGroup.error);

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
    </Button>
  );
};

export default CreateUserBtn;
