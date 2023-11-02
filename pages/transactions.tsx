import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { Button } from "@/comp/Button";
import { H1, H2, H3 } from "@/comp/Heading";
import TransactionCard from "@/comp/transaction/TransactionCard";
import TransactionModal from "@/comp/transaction/TransactionModal/TransactionModal";

import { useStore } from "@/util/store";
import {
  filterTransactionByDate,
  organizeTransactionByTime,
} from "@/util/transaction";
import { trpc } from "@/util/trpc";
import { FullTransaction } from "@/util/types";

const Page: NextPage = () => {
  const appUser = useStore((state) => state.appUser);

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const [showModal, setShowModal] = useState(false);
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [scopedTransactionArray, setScopedTransactionArray] = useState<
    FullTransaction[]
  >([]);

  useEffect(() => {
    if (!transactionArray.data) {
      transactionArray.status === "loading"
        ? console.debug("Can't set date. transactionArray is loading.")
        : console.error("Can't set date. Fetching transactionArray failed.");

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
      console.error("can't run handleRangeChange. date undefined.");
      return;
    }

    if (rangeFormat === "all") {
      setDate(new Date(Date.now()));
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

  const sortedTransactionArray = useMemo(() => {
    return organizeTransactionByTime(scopedTransactionArray);
  }, [scopedTransactionArray]);

  return (
    <section className="flex w-full justify-center">
      {showModal && <TransactionModal setShowModal={setShowModal} />}

      <div className="flex w-full max-w-sm flex-col items-center gap-y-2 lg:max-w-md">
        {date && (
          <div className="flex items-center">
            <Button
              onClick={() => {
                handleRangeChange(-1);
              }}
            >
              <span className="icon-[tabler--chevron-left] h-8 w-8" />
            </Button>
            <H1>{date.getMonth() + 1}</H1>
            <Button
              onClick={() => {
                handleRangeChange(1);
              }}
            >
              <span className="icon-[tabler--chevron-right] h-8 w-8" />
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

        <ol className="flex w-full max-w-sm flex-col items-center gap-y-2 lg:max-w-md">
          {transactionArray.isLoading ? (
            <li className="flex h-fit w-full flex-col gap-y-3">
              <H2>
                {date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()}
              </H2>

              {Array(10)
                .fill(0)
                .map((i) => (
                  <ol
                    key={Math.random() * (i + 1)}
                    className="h-20 w-full animate-pulse rounded-lg bg-zinc-800"
                  ></ol>
                ))}
            </li>
          ) : (
            sortedTransactionArray.map((year, i) =>
              year.map((month, j) => (
                <li
                  key={Math.random() * (j + 1)}
                  className="w-full flex-col gap-y-1"
                >
                  <ol className="flex flex-col gap-y-1">
                    {month.map((day, k) => (
                      <li
                        className="flex w-full flex-col gap-y-1"
                        key={Math.random() * (k + 1)}
                      >
                        <H3>{day[0]?.date.slice(8)}</H3>
                        <ol className="flex flex-col gap-y-3">
                          {day.length === 0 ? (
                            <div>
                              No transaction this month! That{"'"}s a good
                              thing, right?
                            </div>
                          ) : (
                            day.map(
                              (transaction, l) =>
                                transaction && (
                                  <TransactionCard
                                    setShowModal={setShowModal}
                                    transaction={transaction}
                                    key={transaction.transaction_id}
                                  />
                                ),
                            )
                          )}
                        </ol>
                      </li>
                    ))}
                  </ol>
                </li>
              )),
            )
          )}
        </ol>
      </div>
    </section>
  );
};

export default Page;
