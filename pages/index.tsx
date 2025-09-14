import AccountModal from "@/comp/home/AccountModal";
import AccountsView from "@/comp/home/AccountsView";
import CsvUploadInput from "@/comp/home/CsvUploadInput";
import CsvUploadPreviewModal from "@/comp/home/CsvUploadPreviewModal";
import { SplitBtn, SplitBtnOptions } from "@/comp/shared/Button";
import DateRangePicker from "@/comp/shared/DateRangePicker";
import DateSortedTxList from "@/comp/shared/DateSortedTxList";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import type { UnsavedTx } from "@/types/tx";

import { AnimatePresence, motion } from "framer-motion";
import { getScopeIndex, useTxGetAll } from "lib/domain/tx";
import useDateRange from "lib/hooks/useDateRange";
import { useStore } from "lib/store/store";
import type { NextPage } from "next";
import type { AccountBase } from "plaid";
import React, { useEffect, useMemo, useState } from "react";

const Home: NextPage = () => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCsvUploadPreviewModal, setShowCsvUploadPreviewModal] =
    useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();
  const [YMD, setYMD] = useState([-1, -1, -1]);
  const [csvTxArray, setCsvTxArray] = React.useState<UnsavedTx[]>([]);
  const { date, setDate, rangeFormat, setRangeFormat } = useDateRange();

  const txArray = useTxGetAll();
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOrganizedByTimeArray,
  );

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

    switch (rangeFormat) {
      case "year":
        if (y === -1) return [[[[]]]];
        return [txOragnizedByTimeArray[y]];
      case "month":
        if (m === -1) return [[[[]]]];
        return [[txOragnizedByTimeArray[y][m]]];
      case "date":
        if (d === -1) return [[[[]]]];
        return [[[txOragnizedByTimeArray[y][m][d]]]];
      default:
        return txOragnizedByTimeArray;
    }
  }, [txOragnizedByTimeArray, YMD, rangeFormat]);

  return (
    <div className="flex h-full flex-col gap-y-10 lg:flex-row lg:overflow-hidden">
      {(showAccountModal || showTxModal || showCsvUploadPreviewModal) && (
        <motion.div
          className="absolute top-0 left-0 z-[11] h-full w-full overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            setShowAccountModal(false);
            setShowTxModal(false);
            setShowCsvUploadPreviewModal(false);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <AnimatePresence>
        {showAccountModal && clickedAccount && (
          <AccountModal
            setShowModal={setShowAccountModal}
            clickedAccount={clickedAccount}
          />
        )}

        {showTxModal && (
          <TxModalAndCalculator onClose={() => setShowTxModal(false)} />
        )}

        {showCsvUploadPreviewModal && (
          <CsvUploadPreviewModal unsavedTxArray={csvTxArray} />
        )}
      </AnimatePresence>

      <AccountsView
        setClickedAccount={setClickedAccount}
        setShowAccountModal={setShowAccountModal}
      />

      <section className="flex w-full justify-center lg:w-3/5">
        <div className="flex w-full max-w-md flex-col items-center gap-y-2">
          <div className="flex w-full justify-between">
            <DateRangePicker
              date={date}
              setDate={setDate}
              rangeFormat={rangeFormat}
              setRangeFormat={setRangeFormat}
            />

            <SplitBtn>
              Add transaction
              <SplitBtnOptions>
                <CsvUploadInput
                  setCsvTxArray={setCsvTxArray}
                  setShowCsvUploadPreviewModal={setShowCsvUploadPreviewModal}
                />
                Upload CSV
              </SplitBtnOptions>
            </SplitBtn>
          </div>

          <DateSortedTxList
            YMD={YMD}
            rangeFormat={rangeFormat}
            setShowModal={setShowTxModal}
            sortedTxArray={sortedTxArray}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
