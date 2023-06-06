import React from "react";
import Button from "./Button";

import { Transaction as PlaidTransaction } from "plaid";
import { Split } from "@prisma/client";
import { useStoreState } from "../util/store";

interface Props {
  transaction: PlaidTransaction;
  splitArray?: Split[];
  button: () => void;
}

//This part is inefficient; Only one modal needs to open at one point.
//Move it to transaction page and give card ability to change modal data.
const TransactionCard = (props: Props) => {
  const { appUser } = useStoreState((state) => state);

  const splitAmount = props.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser.id
  )?.amount;

  return (
    <div className="bg-zinc-900 p-2">
      <div className="flex w-full justify-between text-start">
        <div>
          <div className="text-lg">{props.transaction.name}</div>
          <div className="text-sm font-light text-zinc-400">
            {props.transaction.merchant_name}
          </div>
        </div>

        <div
          className={`flex gap-x-1 text-lg ${
            props.transaction.amount > 0 ? "" : "text-green-300"
          }`}
        >
          <div>
            {splitAmount ? splitAmount * -1 : props.transaction.amount * -1}
          </div>
          <div>{props.transaction.iso_currency_code}</div>
        </div>
      </div>

      <Button onClick={props.button}>Split</Button>

      <details className="">
        <summary>Raw Data</summary>
        <pre className="max-h-[50vh] overflow-y-scroll whitespace-pre-wrap">
          {JSON.stringify(props.transaction, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TransactionCard;
