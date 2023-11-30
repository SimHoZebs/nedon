import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import SpendingByCategoryList from "@/comp/analysis/SpendingByCategoryList";

import { categoryArrayTotal } from "@/util/category";
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

          <div className="flex h-9 w-full gap-x-1 overflow-hidden rounded-lg bg-zinc-900">
            <AnalysisBar
              organizedTxByCategoryArray={organizedTxByCategoryArray}
              spendingTotal={categoryArrayTotal(
                organizedTxByCategoryArray,
                "spending",
              )}
            />
          </div>

          <p>
            Total spending: $
            {categoryArrayTotal(organizedTxByCategoryArray, "spending")}
          </p>

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
