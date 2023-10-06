import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { ActionBtn, Button } from "@/comp/Button";
import { H2, H4 } from "@/comp/Heading";
import SettleModal from "@/comp/analysis/SettleModal";

import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import {
  filterTransactionByDate,
  organizeTransactionByCategory,
} from "@/util/transaction";
import { trpc } from "@/util/trpc";
import { FullTransaction, TreedCategoryWithTransaction } from "@/util/types";

const subCategoryTotal = (
  parentCategory: TreedCategoryWithTransaction,
  transactionType: "received" | "spending",
): number => {
  const spending = parentCategory.subCategoryArray.reduce(
    (total, subCategory) => {
      let amount =
        transactionType === "received"
          ? subCategory.received
          : subCategory.spending;
      return total + amount + subCategoryTotal(subCategory, transactionType);
    },
    0,
  );

  return spending;
};

const categoryArrayTotal = (
  categoryArray: TreedCategoryWithTransaction[],
  transactionType: "received" | "spending",
): number => {
  const spending = categoryArray.reduce((total, category) => {
    let amount =
      transactionType === "received" ? category.received : category.spending;
    return total + amount + subCategoryTotal(category, transactionType);
  }, 0);

  return parseMoney(spending);
};

const render = (hierarchicalCategoryArray: TreedCategoryWithTransaction[]) =>
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
  const appUser = useStore((state) => state.appUser);
  const [showModal, setShowModal] = useState(false);
  const [oweUser, setOweUser] = useState<{ id: string; amount: number }>();
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("all");
  const [date, setDate] = useState<Date>();
  const [scopedTransactionArray, setScopedTransactionArray] = useState<
    FullTransaction[]
  >([]);

  const transactionArray = trpc.transaction.getAll.useQuery<FullTransaction[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const associatedTransactionArray = trpc.transaction.getAllAssociated.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  useEffect(() => {
    if (!transactionArray.data) {
      transactionArray.status === "loading"
        ? console.debug(
            "can't set date nor scopedTransactionArray. transactionArray is loading.",
          )
        : console.error(
            "can't set date nor scopedTransactionArray. Fetching transactionArray failed.",
          );

      return;
    }

    if (!date) {
      const initialDate = new Date(transactionArray.data.at(-1)!.date);

      setDate(initialDate);
      return;
    }

    if (rangeFormat === "all") {
      setScopedTransactionArray(transactionArray.data);
      return;
    }

    const filteredArray = filterTransactionByDate(
      transactionArray.data,
      date,
      rangeFormat,
    );

    setScopedTransactionArray(filteredArray);
  }, [date, rangeFormat, transactionArray.data, transactionArray.status]);

  const handleRangeChange = (change: 1 | -1) => {
    if (!date) {
      console.error("Can't run handleRangeChange. date undefined.");
      return;
    }

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
                  {Math.abs(parseMoney(calcOweGroup[userId]))}
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
      </div>

      <div>
        <p>
          Total spending:{" "}
          {categoryArrayTotal(
            organizeTransactionByCategory(scopedTransactionArray),
            "spending",
          )}
        </p>
        <p>
          Total received:{" "}
          {categoryArrayTotal(
            organizeTransactionByCategory(scopedTransactionArray),
            "received",
          ) * -1}
        </p>

        {/*future visualization bar*/}
        <div className="h-14 w-full rounded-none border border-zinc-500">
          {organizeTransactionByCategory(scopedTransactionArray).map(
            (category, i) => (
              <div key={i} style={{ width: `%` }}></div>
            ),
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
          title="scope"
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
