import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import LineGraph from "@/comp/analysis/LineGraph";
import SpendingByCatList from "@/comp/analysis/SpendingByCatList";

import { calcCatTypeTotal, subCatTotal } from "@/util/cat";
import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import {
  filterTxByDate,
  organizeTxByCat,
  txTypeArray as txTypes,
} from "@/util/tx";
import type { TxType } from "@/util/tx";
import type { FullTx } from "@/util/types";
import useDateRange from "@/util/useDateRange";

const Page = () => {
  const { appUser } = getAppUser();
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);

  const txArray = trpc.tx.getAll.useQuery<FullTx[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const [txType, setTxType] = useState<TxType>("spending");

  const txTypeArray: React.MutableRefObject<typeof txTypes> = useRef(txTypes);

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

  const sortedTxArray = useMemo(() => {
    const organizedTxByCatArray = organizeTxByCat(scopedTxArray);

    return organizedTxByCatArray.sort((a, b) => {
      const aTotal = Math.abs(
        subCatTotal(a, txType) +
          (txType === "spending" ? a.spending : a.received),
      );
      const bTotal = Math.abs(
        subCatTotal(b, txType) +
          (txType === "spending" ? b.spending : b.received),
      );
      return aTotal - bTotal;
    });
  }, [scopedTxArray, txType]);

  const spendingTotal = calcCatTypeTotal(sortedTxArray, "spending");

  return appUser ? (
    <section className="flex flex-col items-center gap-y-4">
      <div className="w-full max-w-lg">
        <div className="flex w-full flex-col items-center gap-y-2">
          <div className="flex rounded-md bg-zinc-800 p-2">
            {txTypeArray.current.map((type) => (
              <Button
                key={type}
                className={`px-3 text-sm ${
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
            organizedTxByCatArray={sortedTxArray.reverse()}
            spendingTotal={spendingTotal}
          />

          <div className="flex w-full flex-col gap-y-2">
            <SpendingByCatList
              hierarchicalCatArray={sortedTxArray}
              txType={txType}
            />
          </div>
        </div>
      </div>
    </section>
  ) : null;
};

export default Page;
