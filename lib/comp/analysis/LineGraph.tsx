import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import type { TxType } from "@/util/tx";

import type { TxInDB } from "@/types/tx";

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
    (store) => store.txOragnizedByTimeArray,
  );
  const [dailyTxSumArray, setDailyTxSumArray] = useState([
    { date: 0, amount: 0 },
  ]);

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
  txArray: TxInDB[][],
  txType: TxType,
  dateLen: number,
) => {
  const result: { date: number; amount: number }[] = [];
  let amountSum = 0;
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
      amountSum += txArray[txIndex].reduce((acc, curr) => {
        switch (txType) {
          case "spending":
            return curr.amount > 0 ? acc + curr.amount : acc;
          case "received":
            return curr.amount < 0 ? acc - curr.amount : acc;
          default:
            return acc;
        }
      }, 0);
      txIndex--;
    }

    result.push({
      date: i,
      amount: parseMoney(amountSum),
    });
  }

  result.sort((a, b) => a.date - b.date);
  return result;
};

export default LineGraph;
