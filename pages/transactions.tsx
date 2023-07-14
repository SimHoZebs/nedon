import { NextPage } from "next";
import React, { useMemo, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import TransactionCard from "../lib/comp/transaction/TransactionCard";
import { FullTransaction } from "../lib/util/types";
import { organizeTransactionByTime } from "../lib/util/transaction";
import TransactionModal from "../lib/comp/transaction/TransactionModal";
import H1 from "../lib/comp/H1";
import H2 from "../lib/comp/H2";
import H3 from "../lib/comp/H3";

const Page: NextPage = () => {
  const { appUser } = useStoreState((state) => state);

  const transactionArray = trpc.transaction.getTransactionArray.useQuery<
    FullTransaction[]
  >(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken }
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<FullTransaction>();

  //organizeTransactionByTime is computationally expensive
  const sortedTransactionArray = useMemo(() => {
    if (!transactionArray.data) return [];
    return organizeTransactionByTime(transactionArray.data);
  }, [transactionArray.data]);

  return appUser ? (
    <section className="flex w-full flex-col items-center">
      {showModal && selectedTransaction && (
        <TransactionModal
          setShowModal={setShowModal}
          transaction={selectedTransaction}
          setTransaction={setSelectedTransaction}
        />
      )}

      <div className="flex w-full max-w-md flex-col items-center gap-y-2 text-4xl ">
        {sortedTransactionArray.map((year, i) => (
          <div className="flex w-full flex-col items-center " key={i}>
            <H1 className="text-3xl font-bold sm:text-4xl">
              {year[0][0][0].date.slice(0, 4)}
            </H1>
            {year.map((month, j) => (
              <div key={j} className="w-full flex-col gap-y-2">
                <H2>{month[0][0].date.slice(5, 7)}</H2>
                {month.map((day, k) => (
                  <div className="flex w-full flex-col gap-y-3" key={k}>
                    <H3>{day[0].date.slice(8)}</H3>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <TransactionCard
                            button={() => {
                              if (!appUser) return;

                              setShowModal(true);
                              setSelectedTransaction(transaction);
                            }}
                            transaction={transaction}
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
