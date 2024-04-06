import { useEffect, useState } from "react";

const useDateRange = (initialDate: Date | undefined) => {
  const [date, setDate] = useState<Date>(new Date(Date.now()));

  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      return;
    }
  }, [initialDate]);

  return {
    date,
    setDate,
    rangeFormat,
    setRangeFormat,
  };
};

export default useDateRange;
