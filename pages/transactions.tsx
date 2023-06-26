import { NextPage } from "next";
import React, { useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction as PlaidTransaction } from "plaid";
import TransactionCard from "../lib/comp/transaction/TransactionCard";
import { useRouter } from "next/router";
import { SplitClientSide } from "../lib/util/types";
import { organizeTransactionByTime } from "../lib/util/transaction";
import TransactionModal from "../lib/comp/transaction/TransactionModal";

const Page: NextPage = () => {
  const { appUser } = useStoreState((state) => state);

  const router = useRouter();
  if (!appUser?.groupArray) router.push("/");

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );
  const transactionMetaArray = trpc.transaction.getMeta.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PlaidTransaction>();
  const [splitArray, setSplitArray] = useState<SplitClientSide[]>([]);

  //organizeTransactionByTime is computationally expensive
  const sortedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [];
    return organizeTransactionByTime(
      transactionArray.data as PlaidTransaction[]
    );
  }, [transactionArray.data]);

  return (
    <div className="flex flex-col ">
      {showModal && selectedTransaction && (
        <TransactionModal
          setShowModal={setShowModal}
          selectedTransaction={selectedTransaction}
          splitArray={splitArray}
          setSplitArray={setSplitArray}
        />
      )}

      {sortedTransactionArray.map((year, i) => (
        <section className="flex w-full flex-col items-center" key={i}>
          <div className="flex flex-col items-center text-4xl">
            <p>{year[0][0][0].date.slice(0, 4)}</p>
            {year.map((month, j) => (
              <div key={j} className="flex-col gap-y-2 text-3xl">
                <p>{month[0][0].date.slice(5, 7)}</p>
                {month.map((day, k) => (
                  <div className="flex flex-col gap-y-3" key={k}>
                    <p className="text-xl">{day[0].date.slice(8)}</p>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <TransactionCard
                            button={() => {
                              if (!appUser) return;

                              setShowModal(true);
                              setSelectedTransaction(
                                transaction as PlaidTransaction
                              );

                              const meta = transactionMetaArray.data?.find(
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
                            transaction={transaction as PlaidTransaction}
                            splitArray={
                              transactionMetaArray.data?.find(
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
        </section>
      ))}
    </div>
  );
};

export default Page;
