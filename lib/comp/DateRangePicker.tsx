import React from "react";
import { date, z } from "zod";

import { Button } from "./Button";
import { H1 } from "./Heading";

interface Props {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
  rangeFormat: "date" | "month" | "year" | "all";
  setRangeFormat: React.Dispatch<
    React.SetStateAction<"date" | "month" | "year" | "all">
  >;
}

const DateRangePicker = (props: Props) => {
  const handleRangeChange = (change: 1 | -1) => {
    if (!date) {
      console.error("Can't run handleRangeChange. date undefined.");
      return;
    }

    if (props.rangeFormat === "all") {
      props.setDate(new Date(Date.now()));
      return;
    }

    const newDate = new Date(props.date);

    switch (props.rangeFormat) {
      case "date":
        newDate.setDate(props.date.getDate() + change);
        break;
      case "month":
        newDate.setMonth(props.date.getMonth() + change);
        break;
      case "year":
        newDate.setFullYear(props.date.getFullYear() + change);
        break;
    }

    props.setDate(newDate);
  };

  return (
    <div className="flex flex-col items-center">
      {props.date && (
        <div className="flex items-center">
          <Button
            onClick={() => {
              handleRangeChange(-1);
            }}
          >
            <span className="icon-[tabler--chevron-left] h-8 w-8" />
          </Button>
          <H1>{props.date.getMonth() + 1}</H1>
          <Button
            onClick={() => {
              handleRangeChange(1);
            }}
          >
            <span className="icon-[tabler--chevron-right] h-8 w-8" />
          </Button>
        </div>
      )}

      <select
        title="scope"
        className="bg-zinc-800"
        name="scope"
        id=""
        value={props.rangeFormat}
        onChange={(e) => {
          const test = z.union([
            z.literal("date"),
            z.literal("month"),
            z.literal("year"),
            z.literal("all"),
          ]);
          const result = test.parse(e.target.value);
          props.setRangeFormat(result);
        }}
      >
        <option value="date">date</option>
        <option value="month">month</option>
        <option value="year">year</option>
        <option value="all">all</option>
      </select>
    </div>
  );
};

export default DateRangePicker;
