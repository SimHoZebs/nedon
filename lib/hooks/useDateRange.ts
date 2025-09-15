import { useStore } from "../store/store";

import { useEffect, useState } from "react";

/**
 * Don't use this anywhere but in index.tsx
 * If you really must, consider:
 * - for initDate, the date is in global store, not in this hook
 */
const useDateRange = () => {
  const initDate = useStore((state) => state.appInitDatetime);
  const [date, setDate] = useState<Date>(new Date(initDate));

  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");

  useEffect(() => {
    if (initDate) {
      setDate(new Date(initDate));
      return;
    }
  }, [initDate]);

  return {
    date,
    setDate,
    rangeFormat,
    setRangeFormat,
  };
};

export default useDateRange;
