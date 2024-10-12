import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import React, { useEffect, useMemo, useState } from "react";

import { ActionBtn } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import getAppUser from "@/util/getAppUser";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { getScopeIndex } from "@/util/tx";
import useDateRange from "@/util/useDateRange";

const Page: NextPage = () => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  const txOragnizedByTimeArray = useStore(
    (store) => store.txOragnizedByTimeArray,
  );
  const [showModal, setShowModal] = useState(false);
  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);
  const [YMD, setYMD] = useState([-1, -1, -1]);

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "pending"
        ? console.debug("Can't set date. txArray is loading.")
        : console.error("Can't set date. Fetching txArray failed.");

      return;
    }

    if (rangeFormat === "all") {
      return;
    }

    const ymd = getScopeIndex(txOragnizedByTimeArray, date, rangeFormat);
    setYMD(ymd);
  }, [date, rangeFormat, txArray.data, txArray.status, txOragnizedByTimeArray]);

  const sortedTxArray = useMemo(() => {
    const [y, m, d] = YMD;

    // Typically means dateRange hasn't been set yet
    if (y === -1) return [[[[]]]];

    switch (rangeFormat) {
      case "year":
        return [txOragnizedByTimeArray[y]];
      case "month":
        return [[txOragnizedByTimeArray[y][m]]];
      case "date":
        return [[[txOragnizedByTimeArray[y][m][d]]]];
      default:
        return txOragnizedByTimeArray;
    }
  }, [txOragnizedByTimeArray, YMD, rangeFormat]);

  return (
    <section className="flex w-full justify-center">
      {showModal && (
        <motion.div
          className="absolute left-0 top-0 z-[11] h-full w-full overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
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
        <div className="flex w-full justify-between">
          <DateRangePicker
            date={date}
            setDate={setDate}
            rangeFormat={rangeFormat}
            setRangeFormat={setRangeFormat}
          />

          <ActionBtn
            variant="primary"
            onClick={() => {
              setShowModal(true);
            }}
          >
            + transaction
          </ActionBtn>
        </div>

        <DateSortedTxList
          YMD={YMD}
          rangeFormat={rangeFormat}
          setShowModal={setShowModal}
          sortedTxArray={sortedTxArray}
        />
      </div>
    </section>
  );
};

export default Page;
