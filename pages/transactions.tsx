import { NextPage } from "next";
import React, { useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction } from "plaid";

const Page: NextPage = () => {
  const { user } = useStoreState((state) => state);
  const getAllTransaction = trpc.transaction.getAll.useQuery(
    { id: user.id },
    { staleTime: 3600000 }
  );
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<Transaction>();

  return (
    <div className="flex flex-col gap-y-3">
      {showModal && modalData && (
        <div
          className="absolute z-10 w-screen bg-opacity-70 backdrop-blur-sm h-screen top-0 left-0 bg-zinc-900 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-zinc-900 flex flex-col w-1/2 h-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between ">
              <div>
                <div>{modalData.name}</div>

                <div className="font-light text-zinc-400 text-sm">
                  {modalData.merchant_name}
                </div>

                <div>{modalData.date}</div>
              </div>

              <div className="flex gap-x-1">
                <div>{modalData.iso_currency_code}</div>
                <div>{modalData.amount * -1}</div>
              </div>
            </div>

            <details className="overflow-y-scroll">
              <summary>Raw Data</summary>
              <div className="whitespace-pre-wrap">
                {JSON.stringify(modalData, null, 2)}
              </div>
            </details>
          </div>
        </div>
      )}

      {getAllTransaction.data &&
        getAllTransaction.data.map((year, i) => (
          <div key={i}>
            <div className="text-2xl">{year[0][0][0].date.slice(0, 4)}</div>
            {year.map((month, j) => (
              <div key={j}>
                <div className="text-xl">{month[0][0].date.slice(5, 7)}</div>
                {month.map((day, k) => (
                  <div key={k}>
                    <div className="text-lg">{day[0].date.slice(8)}</div>
                    {day.map(
                      (transaction, l) =>
                        transaction && (
                          <button
                            className="flex justify-between text-start bg-zinc-900 p-2"
                            key={l}
                            onClick={() => {
                              setShowModal(true);
                              setModalData(transaction as Transaction); //Manual cast because trpc can't infer nested type
                            }}
                          >
                            <div>
                              <div>{transaction.name}</div>
                              <div className="font-light text-zinc-400 text-sm">
                                {transaction.merchant_name}
                              </div>
                            </div>
                            <div className="flex gap-x-1">
                              <div>{transaction.iso_currency_code}</div>
                              <div>{transaction.amount * -1}</div>
                            </div>
                          </button>
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
