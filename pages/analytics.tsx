import { AnimatePresence, motion } from "framer-motion";
import type { CatSettings } from "prisma/generated/zod";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import AnalysisBar from "@/comp/analysis/AnalysisBar";
import CatModal from "@/comp/analysis/CatModal";
import LineGraph from "@/comp/analysis/LineGraph";

import { calcCatTypeTotal, subCatTotal } from "@/util/cat";
import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import {
  filterTxByDate,
  organizeTxByCat,
  txTypeArray as txTypes,
} from "@/util/tx";
import type { TxType } from "@/util/tx";
import type { FullTx, TreedCatWithTx } from "@/util/types";
import useDateRange from "@/util/useDateRange";
import CatCard from "@/comp/analysis/CatCard";

const Page = () => {
  const { appUser } = getAppUser();
  const [scopedTxArray, setScopedTxArray] = useState<FullTx[]>([]);

  const txArray = trpc.tx.getAll.useQuery<FullTx[]>(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const catAllSettings = trpc.cat.getAllSettings.useQuery(appUser?.id || "", {
    enabled: !!appUser,
  });

  const [txType, setTxType] = useState<TxType>("spending");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    settings?: CatSettings;
    data: TreedCatWithTx;
  }>();

  const txTypeArray: React.MutableRefObject<typeof txTypes> = useRef(txTypes);

  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);

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
      setScopedTxArray(txArray.data);
      return;
    }

    const filteredArray = filterTxByDate(txArray.data, date, rangeFormat);

    setScopedTxArray(filteredArray);
  }, [date, rangeFormat, txArray.data, txArray.status]);

  const treedCatWithTxArray = useMemo(() => {
    const organizedTxByCatArray = organizeTxByCat(scopedTxArray);

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
  }, [scopedTxArray, txType]);

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
        {showModal && modalData && (
          <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center overflow-hidden">
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
            <LineGraph txType={txType} date={date} rangeFormat={rangeFormat} />
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
                catSettings={catAllSettings.data?.find(
                  (catSettings) => catSettings.name === cat.name,
                )}
                showModal={() => {
                  if (!catAllSettings.data) return;
                  const selectedSettings = catAllSettings.data.find(
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
