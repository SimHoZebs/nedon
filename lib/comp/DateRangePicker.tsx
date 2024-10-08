import type React from "react";
import { date, z } from "zod";

import { Button } from "./Button";
import { H1, H2, H3 } from "./Heading";

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
    props.date && (
      <div className="flex items-center">
        <Button
          onClick={() => {
            handleRangeChange(-1);
          }}
        >
          <span className="icon-[tabler--chevron-left] h-6 w-6" />
        </Button>
        <H2>{props.date.getMonth() + 1}</H2>
        <Button
          onClick={() => {
            handleRangeChange(1);
          }}
        >
          <span className="icon-[tabler--chevron-right] h-6 w-6" />
        </Button>
      </div>
    )
  );
};

export default DateRangePicker;
