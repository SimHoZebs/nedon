import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import {
  filterTransactionByDate,
  organizeTransactionByCategory,
} from "../lib/util/transaction";
import ActionBtn from "../lib/comp/Button/ActionBtn";
import Button from "../lib/comp/Button";
import SettleModal from "../lib/comp/analysis/SettleModal";
import {
  HierarchicalCategoryWithTransaction,
  FullTransaction,
} from "../lib/util/types";
import H2 from "../lib/comp/H2";
import H4 from "../lib/comp/H4";
import { z } from "zod";

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
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("all");
  const [date, setDate] = useState<Date>();
  const [scopedTransactionArray, setScopedTransactionArray] = useState<
    FullTransaction[]
  >([]);

  const transactionArray = trpc.transaction.getTransactionArray.useQuery<
    FullTransaction[]
  >(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser }
  );
  const associatedTransactionArray =
    trpc.transaction.getAssociatedTransactionArray.useQuery(
      { id: appUser ? appUser.id : "" },
      { staleTime: 3600000, enabled: !!appUser }
    );

  useEffect(() => {
    if (!transactionArray.data) return;
    const initialDate = new Date(
      transactionArray.data[transactionArray.data.length - 1].date
    );

    setDate(initialDate);
  }, [transactionArray.data]);

  useEffect(() => {
    if (!transactionArray.data || !date) return;

    if (rangeFormat === "all") {
      setScopedTransactionArray(transactionArray.data);
      return;
    }

    const filteredArray = filterTransactionByDate(
      transactionArray.data,
      date,
      rangeFormat
    );

    setScopedTransactionArray(filteredArray);
  }, [date, rangeFormat, transactionArray.data]);

  const handleRangeChange = (change: 1 | -1) => {
    if (!date) return;

    if (rangeFormat === "all") {
      setDate(undefined);
      return;
    }

    const newDate = new Date(date);

    switch (rangeFormat) {
      case "date":
        newDate.setDate(date.getDate() + change);
        break;
      case "month":
        newDate.setMonth(date.getMonth() + change);
        break;
      case "year":
        newDate.setFullYear(date.getFullYear() + change);
        break;
    }

    setDate(newDate);
  };

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
      <div>
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
                <ActionBtn
                  onClick={() => {
                    setShowModal(true);
                    setOweUser({
                      id: userId,
                      amount: Math.floor(calcOweGroup[userId] * 100) / 100,
                    });
                  }}
                >
                  Manually settle
                </ActionBtn>
              </div>
            ))}
        </div>
      </div>

      <div>
        <p>
          Total spending:{" "}
          {categoryArrayTotal(
            organizeTransactionByCategory(scopedTransactionArray),
            "spending"
          )}
        </p>
        <p>
          Total received:{" "}
          {categoryArrayTotal(
            organizeTransactionByCategory(scopedTransactionArray),
            "received"
          ) * -1}
        </p>

        {/*future visualization bar*/}
        <div className="h-14 w-full rounded-none border border-zinc-500">
          {organizeTransactionByCategory(scopedTransactionArray).map(
            (category, i) => (
              <div key={i} style={{ width: `%` }}></div>
            )
          )}
        </div>

        {date && (
          <div className="flex">
            <Button
              onClick={() => {
                handleRangeChange(-1);
              }}
            >
              back
            </Button>
            <p>
              {rangeFormat === "year" && date.getFullYear()}
              {rangeFormat === "month" && date.getMonth() + 1}
              {rangeFormat === "date" && date.getDate()}
            </p>
            <Button
              onClick={() => {
                handleRangeChange(1);
              }}
            >
              next
            </Button>
          </div>
        )}

        <select
          className="bg-zinc-800"
          name="scope"
          id=""
          value={rangeFormat}
          onChange={(e) => {
            const test = z.union([
              z.literal("date"),
              z.literal("month"),
              z.literal("year"),
              z.literal("all"),
            ]);
            const result = test.parse(e.target.value);
            setRangeFormat(result);
          }}
        >
          <option value="date">date</option>
          <option value="month">month</option>
          <option value="year">year</option>
          <option value="all">all</option>
        </select>

        {render(organizeTransactionByCategory(scopedTransactionArray))}
      </div>
    </section>
  ) : null;
};

export default Page;
