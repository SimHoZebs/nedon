import React, { useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import {
  CategoryWithTransactionArray,
  organizeTransactionByCategory,
} from "../lib/util/transaction";
import Button from "../lib/comp/Button/ActionBtn";
import SettleModal from "../lib/comp/analysis/SettleModal";

const categoryTotalSpending = (
  category: CategoryWithTransactionArray
): number => {
  let amount = category.transactionArray.reduce((total, transaction) => {
    return total + transaction.amount;
  }, 0);

  category.subCategory.forEach((subCategory) => {
    amount += categoryTotalSpending(subCategory);
  }, 0);

  return amount;
};

const render = (categoryArray: CategoryWithTransactionArray[]) =>
  categoryArray.map((category, i) => (
    <div key={i} className="border">
      <div>{category.name}</div>
      <div>{categoryTotalSpending(category)}</div>
      <div className="flex flex-col gap-y-3 p-3">
        {category.subCategory.length > 0 && render(category.subCategory)}
      </div>
    </div>
  ));

const Page = () => {
  const { appUser } = useStoreState((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{ id: string; amount: number }>();

  const transactionArray = trpc.transaction.getPlaidTransactionArray.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );
  const associatedTransactionArray =
    trpc.transaction.getAssociatedTransactionArray.useQuery(
      { id: appUser ? appUser.id : "" },
      { staleTime: 3600000, enabled: appUser?.hasAccessToken }
    );

  //useMemo is probably unnecessary since this page doesn't re-render that much.
  const categorizedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [];
    return organizeTransactionByCategory(transactionArray.data);
  }, [transactionArray.data]);

  const calcOweGroup = useMemo(() => {
    if (!associatedTransactionArray.data) return;
    const oweGroup: { [userId: string]: number } = {};

    associatedTransactionArray.data.forEach((transaction) => {
      if (!appUser) return;

      transaction.splitArray.forEach((split) => {
        if (transaction.ownerId === appUser.id) {
          if (split.userId === appUser.id) return;

          //amount others owe appUser
          oweGroup[split.userId]
            ? (oweGroup[split.userId] += split.amount)
            : (oweGroup[split.userId] = split.amount);
        } else {
          if (split.userId === appUser.id) {
            //amount appUser owe others subtracted from total owe
            oweGroup[transaction.ownerId]
              ? (oweGroup[transaction.ownerId] -= split.amount)
              : (oweGroup[transaction.ownerId] = -split.amount);
          }
        }
      });
    });

    return oweGroup;
  }, [appUser, associatedTransactionArray.data]);

  return appUser ? (
    <section className="flex flex-col gap-y-4">
      {showModal && (
        <SettleModal oweUser={oweUser} setShowModal={setShowModal} />
      )}

      <div>
        {calcOweGroup &&
          Object.keys(calcOweGroup).map((userId, index) => (
            <div key={index} className="flex flex-row gap-x-2">
              <div>{userId.slice(0, 8)}</div>
              <div>
                {calcOweGroup[userId] < 0 ? "You owe: " : "They owe: "}$
                {Math.abs(Math.floor(calcOweGroup[userId] * 100) / 100)}
              </div>
              <Button
                onClick={() => {
                  setShowModal(true);
                  setOweUser({
                    id: userId,
                    amount: Math.floor(calcOweGroup[userId] * 100) / 100,
                  });
                }}
              >
                Manually settle
              </Button>
            </div>
          ))}
      </div>

      <div>
        {categorizedTransactionArray.map((category, i) => (
          <div key={i} style={{ width: `%` }}></div>
        ))}
      </div>
      {render(categorizedTransactionArray)}
    </section>
  ) : null;
};

export default Page;
