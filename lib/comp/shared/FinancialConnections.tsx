import { ActionBtn } from "@/comp/shared/Button";

import { trpc } from "@/util/trpc";

import useAutoLoadUser from "lib/hooks/useAutoLoadUser";

const FinancialConnections = () => {
  const { user } = useAutoLoadUser();
  const queryClient = trpc.useUtils();
  const connections = trpc.financial.listConnections.useQuery(
    { userId: user?.id || "" },
    { enabled: !!user },
  );
  const sync = trpc.financial.sync.useMutation();

  if (!connections.data?.length) return null;

  return (
    <section className="flex w-full flex-col gap-2">
      <h2 className="font-medium text-lg">Financial connections</h2>
      {connections.data.map((connection) => (
        <div
          className="flex items-center justify-between rounded-lg border border-zinc-700 p-3"
          key={connection.id}
        >
          <div>
            <p>{connection.provider}</p>
            <p className="text-sm text-zinc-400">{connection.status}</p>
          </div>
          {connection.status === "ERROR" && (
            <ActionBtn
              disabled={sync.isPending}
              onClickAsync={async () => {
                await sync.mutateAsync({
                  connectionId: connection.id,
                  startDate: new Date(Date.now() - 89 * 24 * 60 * 60 * 1000),
                });
                await queryClient.invalidate();
              }}
            >
              Retry sync
            </ActionBtn>
          )}
        </div>
      ))}
    </section>
  );
};

export default FinancialConnections;
