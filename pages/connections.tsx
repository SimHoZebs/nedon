import router from "next/router";
import React, { useMemo, useState } from "react";

import { ActionBtn } from "@/comp/Button";
import SettleModal from "@/comp/analysis/SettleModal";

import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";

const Splits = () => {
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{ id: string; amount: number }>();

  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  const associatedTransactionArray = trpc.transaction.getAllAssociated.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const calcOweGroup = useMemo(() => {
    if (!associatedTransactionArray.data) {
      associatedTransactionArray.status === "loading"
        ? console.debug(
            "Can't run calcOweGroup. associatedTransactionArray is loading.",
          )
        : console.error(
            "Can't run calcOweGroup. Fetching associatedTransactionArray failed.",
          );
      return;
    }
    const oweGroup: { [userId: string]: number } = {};

    associatedTransactionArray.data.forEach((transaction) => {
      if (!appUser) {
        console.error("appUser not found");
        return;
      }

      transaction.splitArray.forEach((split) => {
        const splitAmount = split.categoryArray.reduce(
          (total, category) => total + category.amount,
          0,
        );

        if (transaction.ownerId === appUser.id) {
          if (split.userId === appUser.id) return;

          //amount others owe appUser
          oweGroup[split.userId]
            ? (oweGroup[split.userId] += splitAmount)
            : (oweGroup[split.userId] = splitAmount);
        } else {
          if (split.userId === appUser.id) {
            //amount appUser owe others subtracted from total owe
            oweGroup[transaction.ownerId]
              ? (oweGroup[transaction.ownerId] -= splitAmount)
              : (oweGroup[transaction.ownerId] = -splitAmount);
          }
        }
      });
    });

    return oweGroup;
  }, [
    appUser,
    associatedTransactionArray.data,
    associatedTransactionArray.status,
  ]);

  return (
    <section className="flex h-full w-full flex-col items-center">
      {showModal && (
        <SettleModal oweUser={oweUser} setShowModal={setShowModal} />
      )}

      <div className="sm:w-full">
        <ActionBtn onClick={() => router.push("/user")}>
          <div className="flex items-center gap-x-2">
            <span className="icon-[mdi--user-add-outline] h-6 w-6" />
            <p>Add friend</p>
          </div>
        </ActionBtn>
      </div>

      <div className="flex flex-col items-start">
        {calcOweGroup &&
          Object.keys(calcOweGroup).map((userId, index) => (
            <div key={index} className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-3 rounded-lg bg-zinc-800 px-3 py-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex rounded-full border border-zinc-700 p-1">
                    <span className="icon-[mdi--account] h-6 w-6"></span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    {userId.slice(0, 8)}
                  </div>
                </div>
                <div>
                  {calcOweGroup[userId] < 0 ? "You owe: " : "They owe: "}$
                  {Math.abs(parseMoney(calcOweGroup[userId]))}
                </div>
              </div>
              <ActionBtn
                onClick={() => {
                  setShowModal(true);
                  setOweUser({
                    id: userId,
                    amount: parseMoney(calcOweGroup[userId] * 100),
                  });
                }}
              >
                Manually settle
              </ActionBtn>
            </div>
          ))}
      </div>
    </section>
  );
};

export default Splits;
