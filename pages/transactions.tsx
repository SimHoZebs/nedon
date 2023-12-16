import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import TxModal from "@/comp/tx/TxModal/TxModal";

import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByTime } from "@/util/tx";
import { FullTx } from "@/util/types";

const Page: NextPage = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const [showModal, setShowModal] = useState(false);
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "loading"
        ? console.debug("Can't set date. txArray is loading.")
        : console.error("Can't set date. Fetching txArray failed.");

      return;
    }

    if (!date) {
      const initialDate = new Date(txArray.data.at(-1)!.date);

      setDate(initialDate);
      return;
    }

    if (rangeFormat === "all") {
      setScopedTxArray(txArray.data);
      return;
    }

    const filteredArray = filterTxByDate(txArray.data, date, rangeFormat);

    setScopedTxArray(filteredArray);
  }, [date, rangeFormat, txArray.data, txArray.status]);

  const sortedTxArray = useMemo(() => {
    return organizeTxByTime(scopedTxArray);
  }, [scopedTxArray]);

  return (
    <section className="flex w-full justify-center">
      {showModal && <TxModal setShowModal={setShowModal} />}

      <div className="flex w-full max-w-sm flex-col items-center gap-y-2 lg:max-w-md">
        <DateRangePicker
          date={date}
          setDate={setDate}
          rangeFormat={rangeFormat}
          setRangeFormat={setRangeFormat}
        />

        <DateSortedTxList
          setShowModal={setShowModal}
          sortedTxArray={sortedTxArray}
        />
      </div>
    </section>
  );
};

export default Page;
