import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import { filterTxByDate, organizeTxByTime } from "@/util/tx";
import type { FullTxClientSide } from "@/util/types";
import useDateRange from "@/util/useDateRange";

const Page: NextPage = () => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const [showModal, setShowModal] = useState(false);
  const [scopedTxArray, setScopedTxArray] = useState<FullTxClientSide[]>([]);
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
        <motion.div
          className="absolute left-0 top-0 z-10 h-full w-full overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            setShowModal(false);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <AnimatePresence>
        {showModal && (
          <TxModalAndCalculator onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

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
