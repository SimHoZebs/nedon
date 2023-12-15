import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTransactionList from "@/comp/DateSortedTransactionList";
import TransactionModal from "@/comp/transaction/TransactionModal/TransactionModal";

import {
  filterTransactionByDate,
  organizeTransactionByTime,
} from "@/util/transaction";
import { trpc } from "@/util/trpc";
import { FullTransaction } from "@/util/types";

const Page: NextPage = () => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const [showModal, setShowModal] = useState(false);
  const [rangeFormat, setRangeFormat] = useState<
    "date" | "month" | "year" | "all"
  >("month");
  const [date, setDate] = useState<Date>(new Date(Date.now()));
  const [scopedTransactionArray, setScopedTransactionArray] = useState<
    FullTransaction[]
  >([]);

  useEffect(() => {
    if (!transactionArray.data) {
      transactionArray.status === "loading"
        ? console.debug("Can't set date. transactionArray is loading.")
        : console.error("Can't set date. Fetching transactionArray failed.");

      return;
    }

    if (!date) {
      const initialDate = new Date(transactionArray.data.at(-1)!.date);

      setDate(initialDate);
      return;
    }

    if (rangeFormat === "all") {
      setScopedTransactionArray(transactionArray.data);
      return;
    }

    const filteredArray = filterTransactionByDate(
      transactionArray.data,
      date,
      rangeFormat,
    );

    setScopedTransactionArray(filteredArray);
  }, [date, rangeFormat, transactionArray.data, transactionArray.status]);

  const sortedTransactionArray = useMemo(() => {
    return organizeTransactionByTime(scopedTransactionArray);
  }, [scopedTransactionArray]);

  return (
    <section className="flex w-full justify-center">
      {showModal && <TransactionModal setShowModal={setShowModal} />}

      <div className="flex w-full max-w-sm flex-col items-center gap-y-2 lg:max-w-md">
        <DateRangePicker
          date={date}
          setDate={setDate}
          rangeFormat={rangeFormat}
          setRangeFormat={setRangeFormat}
        />

        <DateSortedTransactionList
          setShowModal={setShowModal}
          sortedTransactionArray={sortedTransactionArray}
        />
      </div>
    </section>
  );
};

export default Page;
