import AnalysisBar from "@/comp/analysis/AnalysisBar";
import CatCard from "@/comp/analysis/CatCard";
import CatModal from "@/comp/analysis/CatModal";
import LineGraph from "@/comp/analysis/LineGraph";
import { Button } from "@/comp/shared/Button";
import DateRangePicker from "@/comp/shared/DateRangePicker";

import { trpc } from "@/util/trpc";

import type { CatSettings } from "@/types/catSettings";
import type { Tx } from "@/types/tx";

import Decimal from "decimal.js";
import { AnimatePresence, motion } from "framer-motion";
import type { NestedCatWithTx, TxType } from "lib/domain/tx";
import {
  convertTxArrayToNestedCatWithTxArray,
  getScopeIndex,
  txTypeArray as txTypes,
  useTxGetAll,
} from "lib/domain/tx";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";
import useDateRange from "lib/hooks/useDateRange";
import { useStore } from "lib/store/store";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type ModalData = {
  settings?: CatSettings;
  cat: NestedCatWithTx;
};

const Page = () => {
  const { user: appUser, isLoading } = useAutoLoadUser();
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOrganizedByTimeArray,
  );
  const [YMD, setYMD] = useState<[number, number, number]>([-1, -1, -1]);

  const txArray = useTxGetAll();
  const settings = trpc.settings.get.useQuery(
    { userId: appUser?.id || "" },
    {
      enabled: !!appUser && !isLoading,
    },
  );

  const [txType, setTxType] = useState<TxType>("spending");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData>();

  const txTypeArray: React.MutableRefObject<typeof txTypes> = useRef(txTypes);

  const { date, setDate, rangeFormat, setRangeFormat } = useDateRange();

  useEffect(() => {
    if (!txArray.data) {
      txArray.status === "pending"
        ? console.debug("can't set date nor scopedTxArray. txArray is loading.")
        : console.error(
            "can't set date nor scopedTxArray. Fetching txArray failed.",
          );

      return;
    }

    if (rangeFormat === "all") {
      return;
    }

    const [y, m, d] = getScopeIndex(txOragnizedByTimeArray, date, rangeFormat);
    setYMD([y, m, d]);
  }, [date, rangeFormat, txArray.data, txArray.status, txOragnizedByTimeArray]);

  const { nestedCatWithTxArray, spendingTotal } = useMemo(() => {
    const [y, m, d] = YMD;

    let scopedTxArray: Tx[];
    if (rangeFormat === "all") {
      scopedTxArray = txOragnizedByTimeArray.flat(3);
    } else if (y === -1 || !txOragnizedByTimeArray[y]) {
      return { nestedCatWithTxArray: [], spendingTotal: new Decimal(0) };
    } else if (rangeFormat === "year") {
      scopedTxArray = txOragnizedByTimeArray[y].flat(2);
    } else if (m === -1 || !txOragnizedByTimeArray[y][m]) {
      return { nestedCatWithTxArray: [], spendingTotal: new Decimal(0) };
    } else if (rangeFormat === "month") {
      scopedTxArray = txOragnizedByTimeArray[y][m].flat();
    } else if (d !== -1 && txOragnizedByTimeArray[y][m][d]) {
      scopedTxArray = txOragnizedByTimeArray[y][m][d];
    } else {
      return { nestedCatWithTxArray: [], spendingTotal: new Decimal(0) };
    }

    const txTypeArray = scopedTxArray.filter((tx) => {
      const amount = new Decimal(tx.amount);
      if (txType === "spending") return amount.isPositive();
      if (txType === "received") return amount.isNegative();
      return false;
    });

    const nestedCatWithTxArray =
      convertTxArrayToNestedCatWithTxArray(txTypeArray);

    const spendingTotal = nestedCatWithTxArray.reduce(
      (acc, curr) => acc.add(curr.primary.total.toString()),
      new Decimal(0),
    );

    return { nestedCatWithTxArray, spendingTotal };
  }, [rangeFormat, txOragnizedByTimeArray, txType, YMD]);

  return appUser ? (
    <section className="flex flex-col items-center gap-y-4">
      {showModal && (
        <motion.div
          className="absolute top-0 left-0 z-10 h-full w-full overflow-hidden bg-zinc-950/70 backdrop-blur-sm sm:justify-center"
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
        {showModal && modalData && (
          <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <CatModal setShowModal={setShowModal} modalData={modalData} />
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg">
        <div className="flex w-full flex-col items-center gap-y-2">
          <div className="flex rounded-md bg-zinc-800 p-2">
            {txTypeArray.current.map((type) => (
              <Button
                key={type}
                className={`px-3 text-sm ${
                  txType === type ? "bg-indigo-200/20 text-indigo-200" : ""
                } rounded-md`}
                onClick={() => setTxType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          <DateRangePicker
            date={date}
            setDate={setDate}
            rangeFormat={rangeFormat}
            setRangeFormat={setRangeFormat}
          />

          {date && (
            <LineGraph
              txType={txType}
              date={date}
              rangeFormat={rangeFormat}
              YMD={YMD}
            />
          )}

          {nestedCatWithTxArray.length > 0 && (
            <>
              <AnalysisBar
                organizedTxByCatArray={nestedCatWithTxArray}
                spendingTotal={spendingTotal}
              />

              <div className="flex w-full flex-col gap-y-2">
                {nestedCatWithTxArray.map((cat) => (
                  <CatCard
                    key={cat.primary.name}
                    cat={cat}
                    txType={txType}
                    catSettings={settings.data?.catSettings.find(
                      (catSettings) => catSettings.name === cat.primary.name,
                    )}
                    showModal={() => {
                      if (!settings.data) return;
                      const selectedSettings = settings.data.catSettings.find(
                        (catSettings) => catSettings.name === cat.primary.name,
                      );

                      setModalData({
                        settings: selectedSettings,
                        cat: cat,
                      });
                      setShowModal(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  ) : null;
};

export default Page;
