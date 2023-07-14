import React, { useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { organizeTransactionByCategory } from "../lib/util/transaction";
import Button from "../lib/comp/Button/ActionBtn";
import SettleModal from "../lib/comp/analysis/SettleModal";
import {
  HierarchicalCategoryWithTransaction,
  FullTransaction,
} from "../lib/util/types";
import H2 from "../lib/comp/H2";
import H4 from "../lib/comp/H4";

const subCategoryTotal = (
  parentCategory: HierarchicalCategoryWithTransaction,
  transactionType: "received" | "spending"
): number => {
  const spending = parentCategory.subCategoryArray.reduce(
    (total, subCategory) => {
      let amount =
        transactionType === "received"
          ? subCategory.received
          : subCategory.spending;
      return total + amount + subCategoryTotal(subCategory, transactionType);
    },
    0
  );

  return spending;
};

const categoryArrayTotal = (
  categoryArray: HierarchicalCategoryWithTransaction[],
  transactionType: "received" | "spending"
): number => {
  const spending = categoryArray.reduce((total, category) => {
    let amount =
      transactionType === "received" ? category.received : category.spending;
    return total + amount + subCategoryTotal(category, transactionType);
  }, 0);

  return spending;
};

const render = (
  hierarchicalCategoryArray: HierarchicalCategoryWithTransaction[]
) =>
  hierarchicalCategoryArray.map((category, i) => (
    <div key={i} className="border">
      <H2>{category.name}</H2>

      <H4>Spending</H4>
      <p>This category only: {category.spending}</p>
      <p>
        This and its subcatgories:{" "}
        {category.spending + subCategoryTotal(category, "spending")}
      </p>
      <H4>Received</H4>
      <p>This category only: {category.received}</p>
      <p>
        This and its subcatgories:{" "}
        {category.received + subCategoryTotal(category, "received")}
      </p>
      <div className="flex flex-col gap-y-3 p-3">
        {category.subCategoryArray.length > 0 &&
          render(category.subCategoryArray)}
      </div>
    </div>
  ));

const Page = () => {
  const { appUser } = useStoreState((state) => state);
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{ id: string; amount: number }>();

  const transactionArray = trpc.transaction.getTransactionArray.useQuery<
    FullTransaction[]
  >(
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

      <p>
        Total spending:{" "}
        {categoryArrayTotal(categorizedTransactionArray, "spending")}
      </p>
      <p>
        Total received:{" "}
        {categoryArrayTotal(categorizedTransactionArray, "received") * -1}
      </p>
      <div>
        {categorizedTransactionArray.map((category, i) => (
          <div key={i} style={{ width: `%` }}></div>
        ))}
      </div>
      {render(categorizedTransactionArray)}
      <pre>{JSON.stringify(categorizedTransactionArray, null, 2)}</pre>
    </section>
  ) : null;
};

export default Page;
