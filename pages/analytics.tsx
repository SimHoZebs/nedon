import AnalysisBar from "@/comp/analysis/AnalysisBar";
import CatCard from "@/comp/analysis/CatCard";
import CatModal from "@/comp/analysis/CatModal";
import LineGraph from "@/comp/analysis/LineGraph";
import { Button } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";

import { calcCatTypeTotal, subCatTotal } from "@/util/cat";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import type { TxType } from "@/util/tx";
import {
  getScopeIndex,
  organizeTxByCat,
  txTypeArray as txTypes,
  useTxGetAll,
} from "@/util/tx";
import useAppUser from "@/util/useAppUser";
import useDateRange from "@/util/useDateRange";

import type { TreedCatWithTx } from "@/types/cat";

import type { CatSettings } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

const Page = () => {
  const appUser = useAppUser();
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOragnizedByTimeArray,
  );
  const [YMD, setYMD] = useState<[number, number, number]>([-1, -1, -1]);

  const txArray = useTxGetAll();
  const settings = trpc.settings.get.useQuery(
    { userId: appUser?.id || "" },
    {
      enabled: !!appUser,
    },
  );

  const [txType, setTxType] = useState<TxType>("spending");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    settings?: CatSettings;
    data: TreedCatWithTx;
  }>();

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

  const treedCatWithTxArray = useMemo(() => {
    const [y, m, _d] = YMD;

    if (y === -1 || !txOragnizedByTimeArray[y][m]) return [];

    const organizedTxByCatArray = organizeTxByCat(
      txOragnizedByTimeArray[y][m].flat(),
    );

    return organizedTxByCatArray.sort((a, b) => {
      const aTotal = Math.abs(
        subCatTotal(a, txType) +
          (txType === "spending" ? a.spending : a.received),
      );
      const bTotal = Math.abs(
        subCatTotal(b, txType) +
          (txType === "spending" ? b.spending : b.received),
      );
      return aTotal - bTotal;
    });
  }, [txType, txOragnizedByTimeArray, YMD]);

  const spendingTotal = calcCatTypeTotal(treedCatWithTxArray, "spending");

  const sortCatAmount = (catArray: TreedCatWithTx[]) => {
    return catArray.sort((b, a) => {
      const aTotal =
        subCatTotal(a, txType) +
        (txType === "spending" ? a.spending : a.received);
      const bTotal =
        subCatTotal(b, txType) +
        (txType === "spending" ? b.spending : b.received);
      return aTotal - bTotal;
    });
  };

  return appUser ? (
    <section className="flex flex-col items-center gap-y-4">
      {showModal && (
        <motion.div
          className="absolute top-0 left-0 z-10 h-full w-full overflow-hidden bg-zinc-950 bg-opacity-70 backdrop-blur-sm sm:justify-center"
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
                  txType === type
                    ? "bg-indigo-200 bg-opacity-20 text-indigo-200"
                    : ""
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

          <AnalysisBar
            organizedTxByCatArray={treedCatWithTxArray.reverse()}
            spendingTotal={spendingTotal}
          />

          <div className="flex w-full flex-col gap-y-2">
            {sortCatAmount(treedCatWithTxArray).map((cat) => (
              <CatCard
                key={cat.name}
                cat={cat}
                txType={txType}
                catSettings={settings.data?.catSettings.find(
                  (catSettings) => catSettings.name === cat.name,
                )}
                showModal={() => {
                  if (!settings.data) return;
                  const selectedSettings = settings.data.catSettings.find(
                    (catSettings) => catSettings.name === cat.name,
                  );

                  setModalData({
                    settings: selectedSettings,
                    data: cat,
                  });
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  ) : null;
};

export default Page;
