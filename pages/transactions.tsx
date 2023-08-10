import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStore } from "../lib/util/store";
import TransactionCard from "../lib/comp/transaction/TransactionCard";
import { FullTransaction } from "../lib/util/types";
import {
  filterTransactionByDate,
  organizeTransactionByTime,
} from "../lib/util/transaction";
import TransactionModal from "../lib/comp/transaction/TransactionModal/TransactionModal";
import H1 from "../lib/comp/H1";
import H2 from "../lib/comp/H2";
import H3 from "../lib/comp/H3";
import Button from "../lib/comp/Button/Button";
import { z } from "zod";

const Page: NextPage = () => {
  const appUser = useStore((state) => state.appUser);

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
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
      rangeFormat
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

      <div className="flex w-full max-w-md flex-col items-center gap-y-2">
        {sortedTransactionArray.map((year, i) => (
          <div className="flex w-full flex-col items-center " key={i}>
            <H1 className="text-3xl font-bold sm:text-4xl">
              {year[0][0][0]?.date.slice(0, 4)}
            </H1>
            {year.map((month, j) => (
              <div key={j} className="w-full flex-col gap-y-2">
                <H2>{month[0][0]?.date.slice(5, 7)}</H2>
                {month.map((day, k) => (
                  <div className="flex w-full flex-col gap-y-3" key={k}>
                    <H3>{day[0]?.date.slice(8)}</H3>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <TransactionCard
                            setShowModal={setShowModal}
                            transaction={transaction}
                            key={l}
                          />
                        )
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Page;
