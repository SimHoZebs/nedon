import { ActionBtn } from "@/comp/shared/Button";

import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { useState } from "react";

const SimpleFinBtn = () => {
  const { user } = useAutoLoadUser();
  const [setupToken, setSetupToken] = useState("");
  const queryClient = trpc.useUtils();
  const flow = trpc.financial.beginConnection.useQuery(
    { userId: user?.id || "", provider: "SIMPLEFIN" },
    { enabled: !!user },
  );
  const complete = trpc.financial.completeConnection.useMutation();

  if (!user || flow.data?.type !== "tokenInput") return null;

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-zinc-700 p-3">
      <a
        className="text-indigo-300 underline"
        href={flow.data.createUrl}
        target="_blank"
        rel="noreferrer"
      >
        Create a SimpleFIN Setup Token
      </a>
      <textarea
        className="min-h-24 rounded-md bg-zinc-900 p-2"
        value={setupToken}
        onChange={(event) => setSetupToken(event.target.value)}
        placeholder="Paste the one-time Setup Token"
      />
      <ActionBtn
        disabled={!setupToken.trim() || complete.isPending}
        onClickAsync={async () => {
          const result = await complete.mutateAsync({
            userId: user.id,
            provider: "SIMPLEFIN",
            completion: { type: "setupToken", token: setupToken.trim() },
          });
          await queryClient.invalidate();
          if (!result.initialSync.ok) {
            console.error(
              "Initial financial sync failed",
              result.initialSync.error,
            );
          }
        }}
      >
        Connect SimpleFIN
      </ActionBtn>
    </div>
  );
};

export default SimpleFinBtn;
