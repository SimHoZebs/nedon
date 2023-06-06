import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction as PlaidTransaction } from "plaid";
import TransactionCard from "../lib/comp/TransactionCard";
import Modal from "../lib/comp/Modal";
import UserSplit from "../lib/comp/UserSplit";
import Button from "../lib/comp/Button";
import { useRouter } from "next/router";
import { Transaction as TransactionMeta } from "@prisma/client";
import { SplitClientSide } from "../lib/util/types";

const Page: NextPage = () => {
  const { appUser, appGroup } = useStoreState((state) => state);

  const router = useRouter();
  if (!appUser.hasAccessToken) router.push("/");

  const transactionArray = trpc.transaction.getAll.useQuery(
    { id: appUser.id },
    { staleTime: 3600000, enabled: appUser.hasAccessToken }
  );
  const transactionMetaArray = trpc.transaction.getMeta.useQuery(
    { id: appUser.id },
    { staleTime: 3600000, enabled: appUser.hasAccessToken }
  );
  const createTransactionMeta = trpc.transaction.createMeta.useMutation();
  const updateTransactionMeta = trpc.transaction.updateMeta.useMutation();

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<PlaidTransaction>();
  const [splitArray, setSplitArray] = useState<SplitClientSide[]>([]);
  const [totalSplit, setTotalSplit] = useState(0);

  useEffect(() => {
    const updatedTotalSplit =
      Math.floor(
        splitArray.reduce((amount, split) => amount + split.amount, 0) * 100
      ) / 100;
    setTotalSplit(updatedTotalSplit);
  }, [splitArray]);

  return (
    <div className="flex flex-col ">
      {showModal && selectedTransaction && (
        <Modal setShowModal={setShowModal}>
          <div className="text-4xl">${selectedTransaction.amount * -1}</div>

          {splitArray?.map((split, i) => (
            <div key={i}>
              <UserSplit
                onAmountChange={(amount: number) => {
                  const updatedSplit: SplitClientSide = {
                    ...split,
                    amount,
                  };
                  const updatedSplitArray = [...splitArray];
                  updatedSplitArray[i] = updatedSplit;
                  setSplitArray(updatedSplitArray);
                }}
                amount={selectedTransaction.amount}
                split={split}
              >
                {split.userId.slice(0, 8)}
              </UserSplit>

              {/**FIX: if selectedTransaction is from your acc, you shouldn't be able to remove yourself */}
              {selectedTransaction.account_id === appUser.ITEM_ID ? null : (
                <Button
                  onClick={() => {
                    const newSplitArray = [...splitArray];
                    newSplitArray.splice(i, 1);
                    setSplitArray(newSplitArray);
                  }}
                >
                  Remove
                </Button>
              )}

              {totalSplit !== selectedTransaction.amount && (
                <Button
                  onClick={() => {
                    const newSplitArray = [...splitArray];
                    let newSplitAmount =
                      Math.floor(
                        (split.amount -
                          totalSplit +
                          selectedTransaction.amount) *
                          100
                      ) / 100;

                    if (newSplitAmount < 0) newSplitAmount = 0;

                    newSplitArray[i].amount = newSplitAmount;
                    setSplitArray(newSplitArray);
                  }}
                >
                  Auto adjust
                </Button>
              )}
            </div>
          ))}

          {totalSplit > selectedTransaction.amount ? (
            <div className="text-red-900">
              Split is greater than transaction amount (
              {`totalSplit ${totalSplit}`})
            </div>
          ) : totalSplit < selectedTransaction.amount ? (
            <div className="text-red-900">
              Split is less than transaction amount (
              {`totalSplit ${totalSplit}`})
            </div>
          ) : null}

          <div>
            {appGroup?.userArray &&
              appGroup.userArray.length &&
              appGroup.userArray.map((user, i) =>
                splitArray.find((split) => split.userId === user.id) ? null : (
                  <div key={i} className="flex">
                    <div>{user.id}</div>
                    <Button
                      onClick={() => {
                        const newSplitArray = [...splitArray];
                        newSplitArray.push({
                          id: null,
                          transactionId: selectedTransaction.transaction_id,
                          userId: user.id,
                          amount: 0,
                        });
                        setSplitArray(newSplitArray);
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )
              )}
          </div>

          <div className="flex w-full justify-between">
            <Button
              disabled={totalSplit !== selectedTransaction.amount}
              onClick={async () => {
                if (!appUser.groupArray) return;

                const meta = transactionMetaArray.data?.find(
                  (meta) => meta.id === selectedTransaction.transaction_id
                );

                meta
                  ? await updateTransactionMeta.mutateAsync({
                      splitArray: splitArray,
                      transactionId: selectedTransaction.transaction_id,
                    })
                  : await createTransactionMeta.mutateAsync({
                      splitArray: splitArray,
                      userId: appUser.id,
                      transactionId: selectedTransaction.transaction_id,
                    });

                transactionMetaArray.refetch();
              }}
            >
              Save Split
            </Button>

            <Button className="bg-red-900" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>

          <details className="" onClick={(e) => e.stopPropagation()}>
            <summary>Raw Data</summary>
            <pre className="max-h-[50vh] overflow-y-scroll whitespace-pre-wrap">
              {JSON.stringify(selectedTransaction, null, 2)}
            </pre>
          </details>
        </Modal>
      )}

      {transactionArray.data &&
        transactionArray.data.map((year, i) => (
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
                                setShowModal(true);
                                setSelectedTransaction(
                                  transaction as PlaidTransaction
                                );

                                const meta = transactionMetaArray.data?.find(
                                  (meta) =>
                                    meta.id === transaction.transaction_id
                                );
                                const splitArray = meta
                                  ? meta.splitArray
                                  : [
                                      {
                                        id: null,
                                        transactionId:
                                          transaction.transaction_id,
                                        userId: appUser.id,
                                        amount: transaction.amount,
                                      },
                                    ];

                                setSplitArray(splitArray);
                              }}
                              transaction={transaction as PlaidTransaction}
                              splitArray={
                                transactionMetaArray.data?.find(
                                  (meta) =>
                                    meta.id === transaction.transaction_id
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
