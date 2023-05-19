import { NextPage } from "next";
import React, { useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction } from "plaid";

const Page: NextPage = () => {
  const { user, currentGroup } = useStoreState((state) => state);
  const getAllTransaction = trpc.transaction.getAll.useQuery(
    { id: user.id },
    { staleTime: 3600000 }
  );
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<Transaction>();

  const [userSplit, setUserSplit] = useState(100);
  const [otherSplit, setOtherSplit] = useState(0);

  return (
    <div className="flex flex-col gap-y-3">
      {showModal && modalData && (
        <div
          className="absolute z-10 w-screen bg-opacity-70 backdrop-blur-sm h-screen top-0 left-0 bg-zinc-900 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-zinc-900 flex flex-col w-2/3 h-2/3 p-3"
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

            <div>
              {currentGroup?.userArray && (
                <details>
                  <summary>Split</summary>
                  <div>
                    <div className="">
                      <div className="flex">
                        <div>{userSplit}%</div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={userSplit}
                          onChange={(e) => {
                            setUserSplit(parseInt(e.currentTarget.value));
                            setOtherSplit(
                              100 - parseInt(e.currentTarget.value)
                            );
                          }}
                        />
                        <div>{currentGroup?.userArray[0].id.slice(0, 8)}</div>
                      </div>
                      <div className="flex ">
                        <div>{otherSplit}%</div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={otherSplit}
                          onChange={(e) => {
                            setUserSplit(100 - parseInt(e.currentTarget.value));
                            setOtherSplit(parseInt(e.currentTarget.value));
                          }}
                        />
                        <div>{currentGroup?.userArray[1].id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </div>
                </details>
              )}
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
