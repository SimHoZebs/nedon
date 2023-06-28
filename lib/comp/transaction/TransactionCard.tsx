import React, { useRef } from "react";

import { Transaction as PlaidTransaction } from "plaid";
import { Split } from "@prisma/client";
import { useStoreState } from "../../util/store";
import { Icon } from "@iconify-icon/react";

interface Props {
  transaction: PlaidTransaction;
  splitArray?: Split[];
  button: () => void;
}

const TransactionCard = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const icon = useRef<{ [key: string]: string }>({
    Travel: "mdi:car-outline",
    "Food and Drink": "fluent:food-24-regular",
    Shops: "mdi:shopping-outline",
    Payment: "mdi:exchange",
    Transfer: "mdi:exchange",
  });

  const splitAmount = props.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser?.id
  )?.amount;

  return (
    <div
      className="flex h-[64px] w-full justify-between rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className="flex w-[300px] items-center gap-x-4">
        <div className="flex w-fit">
          <Icon
            className="rounded-full bg-zinc-400 p-1 text-zinc-800"
            icon={
              icon.current[
                props.transaction.category ? props.transaction.category[0] : ""
              ]
            }
            width={36}
          />
        </div>

        <div className="flex-start flex h-full flex-col truncate">
          <p className="truncate text-lg">{props.transaction.name}</p>
          <div className="text-sm font-light text-zinc-400">
            {props.transaction.merchant_name}
          </div>
        </div>
      </div>

      <div className="flex h-fit items-center gap-x-1">
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
        {splitAmount && (
          <Icon icon="lucide:split" width={16} className="text-zinc-400" />
        )}
      </div>
    </div>
  );
};

export default TransactionCard;
