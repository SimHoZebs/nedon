import React, { useMemo } from "react";

import { trpc } from "@/util/trpc";
import { FullTransaction } from "@/util/types";

import { H2, H3 } from "./Heading";
import TransactionCard from "./transaction/TransactionCard";

interface Props {
  sortedTransactionArray: FullTransaction[][][][];
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DateSortedTransactionList = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );

  return transactionArray.isLoading ? (
    <ol className="flex h-fit w-full flex-col gap-y-3">
      <H2>Loading</H2>

      {Array(10)
        .fill(0)
        .map((i) => (
          <li
            key={Math.random() * (i + 1)}
            className="h-20 w-full animate-pulse rounded-lg bg-zinc-800"
          ></li>
        ))}
    </ol>
  ) : (
    <ol className="no-scrollbar flex w-full max-w-sm flex-col items-center gap-y-2  overflow-y-scroll px-1 lg:max-w-md">
      {props.sortedTransactionArray.map((year, i) =>
        year.map((month, j) => (
          <li key={Math.random() * (j + 1)} className="w-full flex-col gap-y-1">
            <ol className="flex flex-col gap-y-1">
              {month.map((day, k) => (
                <li
                  className="flex w-full flex-col gap-y-1"
                  key={Math.random() * (k + 1)}
                >
                  <H3>{day[0]?.date.slice(8)}</H3>
                  <ol className="flex flex-col gap-y-3">
                    {day.length === 0 ? (
                      <div>
                        No transaction this month! That{"'"}s a good thing,
                        right?
                      </div>
                    ) : (
                      day.map(
                        (transaction, l) =>
                          transaction && (
                            <TransactionCard
                              setShowModal={props.setShowModal}
                              transaction={transaction}
                              key={transaction.transaction_id}
                            />
                          ),
                      )
                    )}
                  </ol>
                </li>
              ))}
            </ol>
          </li>
        )),
      )}
    </ol>
  );
};

export default DateSortedTransactionList;
