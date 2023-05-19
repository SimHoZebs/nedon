import { Transaction } from "plaid";
import React, { useState } from "react";
import TransactionModal from "./TransactionModal";

interface Props {
  key: number;
  transaction: Transaction;
}
const TransactionCard = (props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<Transaction>();

  return (
    <button
      className="flex justify-between text-start bg-zinc-900 p-2"
      key={props.key}
      onClick={() => {
        setShowModal(true);
        setModalData(props.transaction as Transaction); //Manual cast because trpc can't infer nested type
      }}
    >
      {showModal && modalData && (
        <TransactionModal modalData={modalData} setShowModal={setShowModal} />
      )}
      <div>
        <div>{props.transaction.name}</div>
        <div className="font-light text-zinc-400 text-sm">
          {props.transaction.merchant_name}
        </div>
      </div>
      <div className="flex gap-x-1">
        <div>{props.transaction.iso_currency_code}</div>
        <div>{props.transaction.amount * -1}</div>
      </div>
    </button>
  );
};

export default TransactionCard;
