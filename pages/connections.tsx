import React, { useMemo, useState } from "react";

import { ActionBtn, Button } from "@/comp/Button";
import SettleModal from "@/comp/analysis/SettleModal";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";

const Connections = () => {
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{ id: string; amount: number }>();

  const { appUser } = getAppUser();

  const appGroup = trpc.group.get.useQuery(
    { id: appUser?.groupArray?.[0].id || "" },
    { staleTime: Number.POSITIVE_INFINITY, enabled: !!appUser },
  );

  const connectionsArray = appGroup.data?.userArray?.filter(
    (user) => user.id !== appUser?.id,
  );

  const removeUserFromGroup = trpc.group.removeUser.useMutation();
  const associatedTxArray = trpc.tx.getAllAssociated.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
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
    const oweGroup: { [userId: string]: number } = {};

    if (!appUser) {
      console.error("appUser not found");
      return;
    }

    for (const tx of associatedTxArray.data) {
      for (const split of tx.splitArray) {
        const splitAmount = split.catArray.reduce(
          (total, cat) => total + cat.amount,
          0,
        );

        if (tx.ownerId === appUser.id) {
          if (split.userId === appUser.id) continue;

          //amount others owe appUser
          oweGroup[split.userId] = oweGroup[split.userId]
            ? oweGroup[split.userId] + splitAmount
            : splitAmount;
        } else {
          if (split.userId === appUser.id) {
            //amount appUser owe others subtracted from total owe
            oweGroup[tx.ownerId] = oweGroup[tx.ownerId]
              ? oweGroup[tx.ownerId] - splitAmount
              : -splitAmount;
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

      <div className="flex max-w-xl flex-col  gap-4">
        {connectionsArray?.map((user) => (
          <div
            className="flex h-fit w-full items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-zinc-800 px-3 py-2 text-start outline outline-1 outline-zinc-700"
            key={user.id}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="flex rounded-full border p-2">
                <span className="icon-[mdi--account] h-8 w-8 " />
              </div>
              <p>{user.name}</p>
            </div>
            {calcOweGroup?.[user.id] && (
              <div className="flex flex-col items-start gap-2">
                <p>
                  {`${calcOweGroup[user.id] < 0 ? "You" : "They"} owe: $${Math.abs(parseMoney(calcOweGroup[user.id]))}`}
                </p>

                <ActionBtn
                  onClick={() => {
                    setShowModal(true);
                    setOweUser({
                      id: user.id,
                      amount: parseMoney(calcOweGroup?.[user.id] || 0 * 100),
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
                if (!appGroup.data) return;
                e.stopPropagation();

                await removeUserFromGroup.mutateAsync({
                  groupId: appGroup.data.id,
                  userId: user.id,
                });

                await queryClient.user.getAll.invalidate();
                await queryClient.group.get.invalidate();
              }}
            >
              <span className="icon-[mdi--user-remove-outline] h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Connections;
