import React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import type {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import getAppUser from "@/util/getAppUser";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { type TxType, filterTxByDate, organizeTxByTime } from "@/util/tx";
import type { TxInDB } from "@/types/tx";

interface Props {
  date: Date;
  rangeFormat: "date" | "month" | "year" | "all";
  txType: TxType;
}

const LineGraph = (props: Props) => {
  const { appUser } = getAppUser();
  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const thisMonthTxArray =
    txArray.data && props.rangeFormat !== "all"
      ? filterTxByDate(txArray.data, props.date, props.rangeFormat)
      : [];

  // Get the number of days in the month
  const date = new Date(props.date.getFullYear(), props.date.getMonth() + 1, 1);

  date.setDate(date.getDate() - 1);

  const timeSortedThisMonthTxArray = organizeTxByTime(thisMonthTxArray)[0][0];

  const dailyTxSumArray = generateDailyTxSumArray(
    timeSortedThisMonthTxArray,
    props.txType,
    date.getDate(),
  );

  return (
    <div className="h-64 w-full rounded-lg bg-zinc-800 pr-4 pt-2 text-xs">
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
      const lastDate = new Date(txArray[0][0]?.date);
      lastDate.setDate(i - 1);

      //...unless the last date is the present
      if (lastDate.getTime() - Date.now() > 0) break;
    }
    //if the date is the same as this transaction's date
    else if (Number.parseInt(txArray[txIndex][0]?.date.slice(8)) === i) {
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

interface CustomToolTipProps {
  toolTipProps: TooltipProps<ValueType, NameType>;
}

const CustomToolTip = (props: CustomToolTipProps) => {
  return (
    <div>
      {JSON.stringify(props.toolTipProps.payload?.[0]?.payload, null, 2)}
    </div>
  );
};
