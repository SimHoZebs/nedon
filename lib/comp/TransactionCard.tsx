import { Transaction } from "plaid";
import React from "react";
import Button from "./Button";

interface Props {
  transaction: Transaction;
  button: () => void;
}

//This part is inefficient; Only one modal needs to open at one point.
//Move it to transaction page and give card ability to change modal data.
const TransactionCard = (props: Props) => {
  return (
    <div className="bg-zinc-900 p-2">
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

      <Button onClick={props.button}>Split</Button>

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
