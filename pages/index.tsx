import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import type { AccountBase } from "plaid";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { ActionBtn } from "@/comp/Button";
import DateRangePicker from "@/comp/DateRangePicker";
import DateSortedTxList from "@/comp/DateSortedTxList";
import { H2, H3 } from "@/comp/Heading";
import AccountCard from "@/comp/home/AccountCard";
import AccountModal from "@/comp/home/AccountModal";
import TxModalAndCalculator from "@/comp/tx/TxModalAndCalculator";

import getAppUser from "@/util/getAppUser";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { getScopeIndex } from "@/util/tx";
import useDateRange from "@/util/useDateRange";

const User: NextPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [clickedAccount, setClickedAccount] = useState<AccountBase>();
  const [YMD, setYMD] = useState([-1, -1, -1]);

  const { appUser } = getAppUser();
  const { date, setDate, rangeFormat, setRangeFormat } =
    useDateRange(undefined);

  const auth = trpc.auth.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: !!appUser },
  );
  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );
  const txOragnizedByTimeArray = useStore(
    (store) => store.txOragnizedByTimeArray,
  );

  const loading = useRef(
    <div className="h-7 w-1/4 animate-pulse rounded-lg bg-zinc-700" />,
  );

  const total = auth.data?.accounts.reduce((current, account) => {
    account.balances.available && (current += account.balances.available);
    return current;
  }, 0);

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
    <div className="flex flex-col gap-y-10 lg:flex-row">
      <section className="flex h-full w-full flex-col items-center gap-y-3 lg:w-2/5">
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
          {showModal && clickedAccount && (
            <AccountModal
              setShowModal={setShowModal}
              clickedAccount={clickedAccount}
            />
          )}
        </AnimatePresence>

        <div className="flex w-full max-w-md flex-col items-center gap-y-3">
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
                        setShowModal(true);
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

        <div className="flex w-full max-w-md flex-col items-center gap-y-2">
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
    </div>
  );
};

export default User;
