import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import LineGraph from "@/comp/analysis/LineGraph";
import SpendingByCatList from "@/comp/analysis/SpendingByCatList";

import { calcCatTypeTotal } from "@/util/cat";
import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByCat } from "@/util/tx";
import { FullTx } from "@/util/types";

const Page = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);

  const txArray = trpc.tx.getAll.useQuery<FullTx[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "loading"
        ? console.debug("can't set date nor scopedTxArray. txArray is loading.")
        : console.error(
            "can't set date nor scopedTxArray. Fetching txArray failed.",
          );

      return;
    }

    if (!date) {
      const initialDate = new Date(txArray.data.at(-1)!.date);

      setDate(initialDate);
      return;
    }

    if (rangeFormat === "all") {
      setScopedTxArray(txArray.data);
      return;
    }

    const filteredArray = filterTxByDate(txArray.data, date, rangeFormat);

    setScopedTxArray(filteredArray);
  }, [date, rangeFormat, txArray.data, txArray.status]);

  const organizedTxByCatArray = useMemo(
    () => organizeTxByCat(scopedTxArray),
    [scopedTxArray],
  );

  const spendingTotal = calcCatTypeTotal(organizedTxByCatArray, "spending");

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
            organizedTxByCatArray={organizedTxByCatArray}
            spendingTotal={spendingTotal}
          />

          <p>Total spending: $ {spendingTotal}</p>

          <div className="flex w-full flex-col gap-y-2">
            <SpendingByCatList hierarchicalCatArray={organizedTxByCatArray} />
          </div>
        </div>
      </div>
    </section>
  ) : null;
};

export default Page;
