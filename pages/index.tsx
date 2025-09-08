import { Button, SplitBtn, SplitBtnOptions } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import { H2, H3 } from "@/comp/Heading";
import AccountCard from "@/comp/home/AccountCard";
import AccountModal from "@/comp/home/AccountModal";
import CsvUploadPreviewModal from "@/comp/home/CsvUploadPreviewModal";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { createTxFromChaseCSV, getScopeIndex, useTxGetAll } from "@/util/tx";
import useAppUser from "@/util/useAppUser";
import useDateRange from "@/util/useDateRange";

import { ChaseCSVTxSchema, type UnsavedTx } from "@/types/tx";

import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Papa from "papaparse";
import type { AccountBase } from "plaid";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

const Home: NextPage = () => {
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCsvUploadPreviewModal, setShowCsvUploadPreviewModal] =
    useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();
  const [YMD, setYMD] = useState([-1, -1, -1]);
  const [csvTxArray, setCsvTxArray] = React.useState<UnsavedTx[]>([]);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const { appUser } = useAppUser();
  const { date, setDate, rangeFormat, setRangeFormat } = useDateRange();

  const auth = trpc.plaid.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );

  const txArray = useTxGetAll();
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOragnizedByTimeArray,
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700" />,
  );

  const total = auth.data?.accounts.reduce(
    (current, account) => current + (account.balances.available || 0),
    0,
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

  const csvToTxArray = (text: string | ArrayBuffer) => {
    //idk what to do with ArrayBuffer yet
    if (typeof text !== "string" || !appUser) return;

    const { data } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.replace(/[^a-zA-Z]/g, ""),
    });

    const chaseTxArray = z.array(ChaseCSVTxSchema).safeParse(data);
    if (!chaseTxArray.success) {
      console.error(chaseTxArray.error);
      return;
    }

    const txArray = chaseTxArray.data.map((csvTx) =>
      createTxFromChaseCSV(csvTx, appUser.id),
    );
    return txArray;
  };

  return (
    <div className="flex h-full flex-col gap-y-10 lg:flex-row lg:overflow-hidden">
      <section className="flex h-full w-full flex-col items-center gap-y-3 lg:w-2/5">
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

        <div className="flex w-full max-w-md flex-col items-center">
          <H2>All Accounts</H2>

          <div className="flex w-full">
            <H3>Total: ${total}</H3>
          </div>

          {auth.fetchStatus === "idle" && auth.status !== "pending" ? (
            auth.data ? (
              auth.data.accounts.map(
                (account) =>
                  account.balances.available && (
                    <AccountCard
                      key={account.account_id}
                      onClick={() => {
                        setClickedAccount(account);
                        setShowAccountModal(true);
                      }}
                    >
                      <p>{account.name}</p>
                      <p className="font-light">
                        ${account.balances.available}
                      </p>
                    </AccountCard>
                  ),
              )
            ) : (
              <div>
                Your connection is fine, but we could not find any accounts in
                our database.
              </div>
            )
          ) : (
            Array.from({ length: 3 }).map((_, index) => (
              //biome-ignore lint: it's just a loading spinner
              <AccountCard key={index} disabled={true}>
                {loading.current}
                {loading.current}
              </AccountCard>
            ))
          )}
        </div>
      </section>

      <section className="flex w-full justify-center lg:w-3/5">
        <input
          type="file"
          accept=".csv"
          className="hidden"
          ref={csvInputRef}
          onChange={(e) => {
            console.log("file uploaded");
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onload = async () => {
              const result = reader.result;
              if (!result) return;

              const chaseTxArray = csvToTxArray(reader.result);

              if (!chaseTxArray) return;

              setCsvTxArray(chaseTxArray);
              setShowCsvUploadPreviewModal(true);
              console.log("completed");
            };

            reader.readAsText(file);
          }}
        />
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
                <Button
                  onClick={() => {
                    if (!csvInputRef.current) return;
                    console.log("resetting");
                    csvInputRef.current.value = "";
                    csvInputRef.current?.click();
                  }}
                >
                  Upload CSV
                </Button>
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
