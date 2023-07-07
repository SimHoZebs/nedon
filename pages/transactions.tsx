import { NextPage } from "next";
import React, { useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction as PlaidTransaction } from "plaid";
import TransactionCard from "../lib/comp/transaction/TransactionCard";
import { SplitClientSide } from "../lib/util/types";
import { organizeTransactionByTime } from "../lib/util/transaction";
import TransactionModal from "../lib/comp/transaction/TransactionModal";

const Page: NextPage = () => {
  const { appUser } = useStoreState((state) => state);

  const plaidTransactionArray =
    trpc.transaction.getPlaidTransactionArray.useQuery(
      { id: appUser ? appUser.id : "" },
      { staleTime: 3600000, enabled: appUser?.hasAccessToken }
    );
  const transactionArray = trpc.transaction.getTransactionArray.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PlaidTransaction>();
  const [splitArray, setSplitArray] = useState<SplitClientSide[]>([]);

  //organizeTransactionByTime is computationally expensive
  const sortedTransactionArray = useMemo(() => {
    if (!plaidTransactionArray.data) return [];
    return organizeTransactionByTime(plaidTransactionArray.data);
  }, [plaidTransactionArray.data]);

  return appUser ? (
    <section className="flex w-full flex-col items-center">
      {showModal && selectedTransaction && (
        <TransactionModal
          setShowModal={setShowModal}
          selectedTransaction={selectedTransaction}
          splitArray={splitArray}
          setSplitArray={setSplitArray}
        />
      )}

      <div className="flex w-full max-w-md flex-col items-center gap-y-2 text-4xl ">
        {sortedTransactionArray.map((year, i) => (
          <div className="flex w-full flex-col items-center " key={i}>
            <p className="text-3xl sm:text-4xl">
              {year[0][0][0].date.slice(0, 4)}
            </p>
            {year.map((month, j) => (
              <div
                key={j}
                className="w-full flex-col gap-y-2 text-2xl sm:text-3xl"
              >
                <p>{month[0][0].date.slice(5, 7)}</p>
                {month.map((day, k) => (
                  <div className="flex w-full flex-col gap-y-3" key={k}>
                    <p className="text-lg sm:text-xl">{day[0].date.slice(8)}</p>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <TransactionCard
                            button={() => {
                              if (!appUser) return;

                              setShowModal(true);
                              setSelectedTransaction(transaction);

                              const meta = transactionArray.data?.find(
                                (meta) => meta.id === transaction.transaction_id
                              );
                              const splitArray = meta
                                ? meta.splitArray
                                : [
                                    {
                                      id: null,
                                      transactionId: transaction.transaction_id,
                                      userId: appUser.id,
                                      amount: transaction.amount,
                                    },
                                  ];

                              setSplitArray(splitArray);
                            }}
                            transaction={transaction}
                            splitArray={
                              transactionArray.data?.find(
                                (meta) => meta.id === transaction.transaction_id
                              )?.splitArray
                            }
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
    </section>
  ) : null;
};

export default Page;
