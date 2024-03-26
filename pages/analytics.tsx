import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import LineGraph from "@/comp/analysis/LineGraph";
import SpendingByCatList from "@/comp/analysis/SpendingByCatList";

import { calcCatTypeTotal } from "@/util/cat";
import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByCat } from "@/util/tx";
import type { FullTx, TxType } from "@/util/types";
import useDateRange from "@/util/useDateRange";

const Page = () => {
  const { appUser } = getAppUser();
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);

  const txArray = trpc.tx.getAll.useQuery<FullTx[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const [txType, setTxType] = useState<TxType>("Spending");

  const txTypeArray: React.MutableRefObject<
    ["Spending", "Earning", "Transfers"]
  > = useRef(["Spending", "Earning", "Transfers"]);

  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "pending"
        ? console.debug("can't set date nor scopedTxArray. txArray is loading.")
        : console.error(
            "can't set date nor scopedTxArray. Fetching txArray failed.",
          );

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
          <div className="flex gap-x-4 rounded-md bg-zinc-800 p-2">
            {txTypeArray.current.map((type) => (
              <Button
                key={type}
                className={`px-4 text-base ${
                  txType === type
                    ? "bg-indigo-200 bg-opacity-20 text-indigo-200"
                    : ""
                } rounded-md`}
                onClick={() => setTxType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            rangeFormat={rangeFormat}
            setRangeFormat={setRangeFormat}
          />

          {date && (
            <LineGraph txType={txType} date={date} rangeFormat={rangeFormat} />
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
