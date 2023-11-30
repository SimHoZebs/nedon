import React from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

import {
  filterTransactionByDate,
  organizeTransactionByTime,
} from "@/util/transaction";
import { trpc } from "@/util/trpc";
import { FullTransaction } from "@/util/types";

interface Props {
  spendingTotal: number;
  date: Date;
  rangeFormat: "date" | "month" | "year" | "all";
}

const LineGraph = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const transactionArray = trpc.transaction.getAll.useQuery<FullTransaction[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const thisMonthTxArray =
    transactionArray.data && props.rangeFormat !== "all"
      ? filterTransactionByDate(
          transactionArray.data,
          props.date,
          props.rangeFormat,
        )
      : [];

  // Get the number of days in the month
  const date = new Date(props.date.getFullYear(), props.date.getMonth() + 1, 1);

  date.setDate(date.getDate() - 1);
  const numberOfDays = date.getDate();

  const thisMonthTimeOrganizedTxArray =
    organizeTransactionByTime(thisMonthTxArray)[0][0];

  const yeet = thisMonthTimeOrganizedTxArray
    .map((day) => ({
      date: day[0]?.date.slice(8),
      amount: day.reduce((acc, curr) => acc + curr.amount, 0),
    }))
    .sort((a, b) => parseInt(a.date) - parseInt(b.date));
  console.log("yeet", yeet);

  return (
    <div className="h-64 w-full rounded-lg bg-zinc-800 pr-4 pt-2 text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={yeet}>
          <XAxis dataKey="date" />
          <YAxis dataKey="amount" domain={[0, "dataMax"]} />
          {/* <Tooltip content={(e) => <CustomToolTip toolTipProps={e} />} /> */}
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
