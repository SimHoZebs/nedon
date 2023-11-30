import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import LineGraph from "@/comp/analysis/LineGraph";
import SpendingByCategoryList from "@/comp/analysis/SpendingByCategoryList";

import { calcCatTypeTotal } from "@/util/category";
import {
  filterTransactionByDate,
  organizeTransactionByCategory,
} from "@/util/transaction";
import { trpc } from "@/util/trpc";
import { FullTransaction } from "@/util/types";

const Page = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [scopedTransactionArray, setScopedTransactionArray] = useState<
    FullTransaction[]
  >([]);

  const transactionArray = trpc.transaction.getAll.useQuery<FullTransaction[]>(
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

  const organizedTxByCategoryArray = useMemo(
    () => organizeTransactionByCategory(scopedTransactionArray),
    [scopedTransactionArray],
  );

  const spendingTotal = calcCatTypeTotal(
    organizedTxByCategoryArray,
    "spending",
  );

  return appUser ? (
    <section className="flex flex-col items-center gap-y-4">
      <div className="w-full max-w-lg">
        <div className="flex w-full flex-col items-center gap-y-2">
          <DateRangePicker
            date={date}
            setDate={setDate}
            rangeFormat={rangeFormat}
            setRangeFormat={setRangeFormat}
          />

          {date && (
            <LineGraph
              spendingTotal={spendingTotal}
              date={date}
              rangeFormat={rangeFormat}
            />
          )}

          <AnalysisBar
            organizedTxByCategoryArray={organizedTxByCategoryArray}
            spendingTotal={spendingTotal}
          />

          <p>Total spending: $ {spendingTotal}</p>

          <div className="flex w-full flex-col gap-y-2">
            <SpendingByCategoryList
              hierarchicalCategoryArray={organizedTxByCategoryArray}
            />
          </div>
        </div>
      </div>
    </section>
  ) : null;
};

export default Page;
