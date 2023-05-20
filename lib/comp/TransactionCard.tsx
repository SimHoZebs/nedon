import { Transaction } from "plaid";
import React, { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { useStoreState } from "../util/store";
import UserSplit from "./UserSplit";

interface Props {
  transaction: Transaction;
}

//This part is inefficient; Only one modal needs to open at one point.
//Move it to transaction page and give card ability to change modal data.
const TransactionCard = (props: Props) => {
  const [showModal, setShowModal] = useState(false);
  const { currentGroup } = useStoreState((state) => state);
  const [splitArray, setSplitArray] = useState([50, 50]);

  return (
    <div className="bg-zinc-900 p-2">
      {showModal && (
        <Modal setShowModal={setShowModal}>
          <div className="text-4xl">${props.transaction.amount * -1}</div>
          <div>
            {currentGroup?.userArray &&
              currentGroup.userArray.length &&
              currentGroup.userArray.map((user, i) => (
                <UserSplit
                  key={i}
                  splitArray={splitArray}
                  setSplitArray={setSplitArray}
                  amount={props.transaction.amount}
                  index={i}
                >
                  {user.id.slice(0, 8)}
                </UserSplit>
              ))}
          </div>

          <div className="flex w-full justify-between">
            <Button>Save Split</Button>
            <Button className="bg-red-900" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      <div className="flex justify-between w-full text-start">
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
      </div>

      <Button
        onClick={() => {
          setShowModal(true);
        }}
      >
        Split
      </Button>

      <details className="">
        <summary>Raw Data</summary>
        <pre className="overflow-y-scroll whitespace-pre-wrap max-h-[50vh]">
          {JSON.stringify(props.transaction, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TransactionCard;
