import { NextPage } from "next";
import React, { useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction } from "plaid";
import TransactionCard from "../lib/comp/TransactionCard";

const Page: NextPage = () => {
  const { user } = useStoreState((state) => state);
  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: user.id },
    { staleTime: 3600000 }
  );

  return (
    <div className="flex flex-col ">
      {transactionArray.data &&
        transactionArray.data.map((year, i) => (
          <div key={i}>
            <div className="text-4xl">{year[0][0][0].date.slice(0, 4)}</div>
            {year.map((month, j) => (
              <div key={j}>
                <div className="text-3xl">{month[0][0].date.slice(5, 7)}</div>
                {month.map((day, k) => (
                  <div className="flex flex-col gap-y-3" key={k}>
                    <div className="text-xl">{day[0].date.slice(8)}</div>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <TransactionCard
                            transaction={transaction as Transaction}
                            key={l}
                          />
                        )
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default Page;
