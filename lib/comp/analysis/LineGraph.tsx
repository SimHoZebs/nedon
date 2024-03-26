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
import { filterTxByDate, organizeTxByTime } from "@/util/tx";
import type { FullTx } from "@/util/types";

interface Props {
  spendingTotal: number;
  date: Date;
  rangeFormat: "date" | "month" | "year" | "all";
}

const LineGraph = (props: Props) => {
  const { appUser } = getAppUser();
  const txArray = trpc.tx.getAll.useQuery<FullTx[]>(
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

  const thisMonthTimeSortedTxArray = organizeTxByTime(thisMonthTxArray)[0][0];

  const dailyTxSumArray = generateDailyTxSumArray(thisMonthTimeSortedTxArray);

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

// txArray is an array of FullTx sorted by latest date
const generateDailyTxSumArray = (txArray: FullTx[][]) => {
  let amountSum = 0;
  const txLen = txArray.length;

  const result: { date: string; amount: number }[] = [];

  for (let i = txLen - 1; i >= 0; i--) {
    const day = txArray[i];
    amountSum += day.reduce((acc, curr) => acc + curr.amount, 0);
    result[txLen - i - 1] = {
      date: day[0]?.date.slice(8),
      amount: parseMoney(amountSum),
    };
  }

  result.sort((a, b) => Number.parseInt(a.date) - Number.parseInt(b.date));
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
