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
  >("all");
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
    <section className="flex w-full flex-col items-center">
      {showModal && <TransactionModal setShowModal={setShowModal} />}

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

      <ol className="flex w-full max-w-md flex-col items-center gap-y-2">
        {transactionArray.isLoading ? (
          <li className="flex w-full h-fit items-center flex-col ">
            <H1>{date.getFullYear()}</H1>
            <div className="flex w-full flex-col gap-y-3">
              <H2>
                {date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth()}
              </H2>

              {Array(10)
                .fill(0)
                .map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full bg-zinc-800 animate-pulse rounded-lg"
                  ></div>
                ))}
            </div>
          </li>
        ) : (
          sortedTransactionArray.map((year, i) => (
            <li className="flex w-full flex-col items-center" key={i}>
              <H1>{year[0][0][0]?.date.slice(0, 4)}</H1>
              <ol className="flex flex-col gap-y-1">
                {year.map((month, j) => (
                  <li key={j} className="w-full flex-col gap-y-1">
                    <H2>{month[0][0]?.date.slice(5, 7)}</H2>
                    <ol className="flex flex-col gap-y-1">
                      {month.map((day, k) => (
                        <li className="flex w-full flex-col gap-y-1" key={k}>
                          <H3>{day[0]?.date.slice(8)}</H3>
                          <ol className="flex flex-col gap-y-3">
                            {day.map(
                              (transaction, l) =>
                                transaction && (
                                  <TransactionCard
                                    setShowModal={setShowModal}
                                    transaction={transaction}
                                    key={l}
                                  />
                                ),
                            )}
                          </ol>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </li>
          ))
        )}
      </ol>
    </section>
  );
};

export default Page;
