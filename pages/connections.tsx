import SettleModal from "@/comp/analysis/SettleModal";

import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";

import { Prisma } from "@prisma/client";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import { ActionBtn, Button } from "lib/shared/Button";
import { useMemo, useState } from "react";

/**
 * Page to show all of user's connections and the amount owed by either party.
 * */
const Connections = () => {
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{
    id: string;
    amount: Prisma.Decimal;
  }>();

  const { user: appUser, isLoading } = useAutoLoadUser();

  const removeConnection = trpc.user.removeConnection.useMutation();
  const associatedTxArray = trpc.tx.getAllAssociated.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser && !isLoading },
  );
  const queryClient = trpc.useUtils();

  const calcOweGroup = useMemo(() => {
    if (!associatedTxArray.data) {
      associatedTxArray.status === "pending"
        ? console.debug("Can't run calcOweGroup. associatedTxArray is loading.")
        : console.error(
            "Can't run calcOweGroup. Fetching associatedTxArray failed.",
          );
      return;
    }
    const oweGroup: { [userId: string]: Prisma.Decimal } = {};

    if (!appUser) {
      console.error("appUser not found");
      return;
    }

    for (const tx of associatedTxArray.data) {
      for (const split of tx.splitTxArray) {
        const splitAmount = split.amount;

        if (tx.ownerId === appUser.id) {
          if (split.ownerId === appUser.id) continue;

          //amount others owe appUser
          oweGroup[split.ownerId] = oweGroup[split.ownerId]
            ? oweGroup[split.ownerId].add(splitAmount)
            : splitAmount;
        } else {
          if (split.ownerId === appUser.id) {
            //amount appUser owe others subtracted from total owe
            oweGroup[tx.ownerId] = oweGroup[tx.ownerId]
              ? oweGroup[tx.ownerId].sub(splitAmount)
              : splitAmount.negated();
          }
        }
      }
    }

    return oweGroup;
  }, [appUser, associatedTxArray.data, associatedTxArray.status]);

  return (
    <section className="flex h-full w-full flex-col items-center">
      {showModal && (
        <SettleModal oweUser={oweUser} setShowModal={setShowModal} />
      )}

      <div className="flex max-w-xl flex-col gap-4">
        {appUser?.myConnectionArray?.map((user) => (
          <div
            className="flex h-fit w-full items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-zinc-800 px-3 py-2 text-start outline-1 outline-zinc-700"
            key={user.id}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex rounded-full border p-2">
                <span className="icon-[mdi--account] h-8 w-8" />
              </div>
              <p>{user.name}</p>
            </div>
            {calcOweGroup?.[user.id] && (
              <div className="flex flex-col items-start gap-2">
                <p>
                  {`${
                    calcOweGroup[user.id].isNegative() ? "You" : "They"
                  } owe: $${Math.abs(parseMoney(calcOweGroup[user.id].toNumber()))}`}
                </p>

                <ActionBtn
                  onClick={() => {
                    setShowModal(true);
                    setOweUser({
                      id: user.id,
                      amount: calcOweGroup?.[user.id] || new Prisma.Decimal(0),
                    });
                  }}
                >
                  <span className="icon-[mdi--cash] h-5 w-5" />
                  Manually settle
                </ActionBtn>
              </div>
            )}

            <Button
              className="text-pink-400 after:h-full after:w-px after:bg-zinc-500"
              onClickAsync={async (e) => {
                if (!appUser.myConnectionArray) return;
                e.stopPropagation();

                await removeConnection.mutateAsync({
                  userId: appUser.id,
                  connectionId: user.id,
                });

                await queryClient.dev.getAllUsers.invalidate();
              }}
            >
              <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
              remove connection
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Connections;
