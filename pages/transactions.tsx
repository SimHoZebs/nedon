import { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByTime } from "@/util/tx";
import { FullTx } from "@/util/types";
import useDateRange from "@/util/useDateRange";

const Page: NextPage = () => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const [showModal, setShowModal] = useState(false);
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);
  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "pending"
        ? console.debug("Can't set date. txArray is loading.")
        : console.error("Can't set date. Fetching txArray failed.");

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
      {showModal && (
        <TxModalAndCalculator onClose={() => setShowModal(false)} />
      )}

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
