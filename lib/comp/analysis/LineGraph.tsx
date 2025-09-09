import { useStore } from "@/util/store";
import type { TxType } from "@/util/tx";

import type { SavedTx } from "@/types/tx";

import { Prisma } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  date: Date;
  rangeFormat: "date" | "month" | "year" | "all";
  txType: TxType;
  YMD: [number, number, number];
}

const LineGraph = (props: Props) => {
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOrganizedByTimeArray,
  );
  const [dailyTxSumArray, setDailyTxSumArray] = useState<
    { date: number; amount: Prisma.Decimal }[]
  >([{ date: 0, amount: new Prisma.Decimal(0) }]);

  useEffect(() => {
    if (props.rangeFormat === "all") {
      const sum = generateDailyTxSumArray(
        txOragnizedByTimeArray.flat(2),
        props.txType,
        31,
      );
      setDailyTxSumArray(sum);
    } else {
      const [y, m, _d] = props.YMD;

      if (y === -1 || m === -1) {
        setDailyTxSumArray([]);
        return;
      }
      const thisMonthTxArray = txOragnizedByTimeArray[y][m];
      // Get the number of days in the month
      const date = new Date(
        props.date.getFullYear(),
        props.date.getMonth() + 1,
        1,
      );

      date.setDate(date.getDate() - 1);

      const sum = generateDailyTxSumArray(
        thisMonthTxArray,
        props.txType,
        date.getDate(),
      );
      setDailyTxSumArray(sum);
    }
  }, [
    props.date,
    props.rangeFormat,
    txOragnizedByTimeArray,
    props.txType,
    props.YMD,
  ]);

  return (
    <div className="relative h-64 w-full pt-2 pr-4 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dailyTxSumArray}>
          <XAxis dataKey="date" />
          <YAxis dataKey="amount" domain={[0, "dataMax"]} />
          <Tooltip />
          <Line
            strokeWidth={3}
            type="monotone"
            dataKey="amount"
            stroke="rgb(161 161 170)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// txArray is a sorted array of FullTx of a single month, starting with latest date
const generateDailyTxSumArray = (
  txArray: SavedTx[][],
  txType: TxType,
  dateLen: number,
) => {
  const result: { date: number; amount: Prisma.Decimal }[] = [];
  let amountSum = new Prisma.Decimal(0);
  let txIndex = txArray.length - 1;

  // Loop through the days of the month and generate empty sums for days with
  // no transactions and sums for days with transactions
  for (let i = 0; i < dateLen; i++) {
    //exhausted existing transactions, just add empty sums
    if (txIndex < 0) {
      const lastDate = txArray[0][0]?.authorizedDatetime;
      lastDate.setDate(i - 1);

      //...unless the last date is the present
      if (lastDate.getTime() - Date.now() > 0) break;
    }
    //if the date is the same as this transaction's date
    else if (txArray[txIndex][0]?.authorizedDatetime.getDate() === i) {
      amountSum = amountSum.add(
        txArray[txIndex].reduce((acc, curr) => {
          switch (txType) {
            case "spending":
              return curr.amount.isPositive() ? acc.add(curr.amount) : acc;
            case "received":
              return curr.amount.isNegative()
                ? acc.sub(curr.amount.negated())
                : acc;
            default:
              return acc;
          }
        }, new Prisma.Decimal(0)),
      );
      txIndex--;
    }

    result.push({
      date: i,
      amount: amountSum,
    });
  }

  result.sort((a, b) => a.date - b.date);
  return result;
};

export default LineGraph;
