import { useEffect, useState } from "react";

import { useStore } from "./store";

const useDateRange = () => {
  const initialDate = useStore((state) => state.datetime);
  const [date, setDate] = useState<Date>(new Date(initialDate));

  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");

  useEffect(() => {
    if (initialDate) {
      setDate(new Date(initialDate));
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
