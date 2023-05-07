import { NextPage } from "next";
import React from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";

const Page: NextPage = () => {
  const { user } = useStoreState((state) => state);
  const transactions = trpc.transactions.useQuery(
    { id: user.id },
    { staleTime: 3600000 }
  );

  return (
    <div className="flex flex-col gap-y-3">
      {transactions.data ? (
        transactions.data.map((transaction, i) => (
          <button
            className="flex justify-between text-start bg-zinc-900 p-2"
            key={i}
          >
            <div>
              <div>{transaction.name}</div>
              <div className="font-light text-zinc-400 text-sm">
                {transaction.merchant_name}
              </div>
              <div>{transaction.date}</div>
            </div>
            <div className="flex gap-x-1">
              <div>{transaction.iso_currency_code}</div>
              <div>{transaction.amount * -1}</div>
            </div>
          </button>
        ))
      ) : (
        <div>loading...</div>
      )}
    </div>
  );
};

export default Page;
