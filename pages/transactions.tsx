import { NextPage } from "next";
import React, { useState } from "react";
import { trpc } from "../lib/util/trpc";
import { useStoreState } from "../lib/util/store";
import { Transaction } from "plaid";
import TransactionCard from "../lib/comp/TransactionCard";
import Modal from "../lib/comp/Modal";
import UserSplit from "../lib/comp/UserSplit";
import Button from "../lib/comp/Button";
import { useRouter } from "next/router";
import { Split } from "@prisma/client";

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const [splitArray, setSplitArray] = useState<Split[]>([]);

  return (
    <div className="flex flex-col ">
      {showModal && selectedTransaction && (
        <Modal setShowModal={setShowModal}>
          <div className="text-4xl">${selectedTransaction.amount * -1}</div>

          <div>
            {splitArray?.map((split, i) => (
              <UserSplit
                key={i}
                splitArray={splitArray}
                setSplitArray={setSplitArray}
                amount={selectedTransaction.amount}
                index={i}
              >
                {split.userId.slice(0, 8)}
              </UserSplit>
            ))}
          </div>

          <div>
            {appGroup?.userArray &&
              appGroup.userArray.length &&
              appGroup.userArray.map((user, i) => <div key={i}>{user.id}</div>)}
          </div>

          <div className="flex w-full justify-between">
            <Button
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
        </Modal>
      )}

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
                            button={() => {
                              setShowModal(true);
                              setSelectedTransaction(
                                transaction as Transaction
                              );

                              const meta = transactionMetaArray.data?.find(
                                (meta) => meta.id === transaction.transaction_id
                              );
                              const splitArray = meta
                                ? meta.splitArray
                                : [
                                    {
                                      id: transaction.transaction_id,
                                      userId: appUser.id,
                                      amount: transaction.amount,
                                    },
                                  ];
                              setSplitArray(splitArray);
                            }}
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
