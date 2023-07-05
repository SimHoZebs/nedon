import React, { useRef } from "react";

import { PlaidTransaction } from "../../util/types";
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
    "Gyms and Fitness Centers": "mingcute:fitness-line",
    Recreation: "material-symbols:relax-outline",
  });

  const splitAmount = props.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser?.id
  )?.amount;

  return (
    <div
      className="flex h-[64px] w-full justify-between gap-x-4 rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className="flex w-fit items-center gap-x-2 truncate sm:gap-x-4">
        <Icon
          className="rounded-full bg-zinc-400 p-1 text-zinc-800"
          icon={
            icon.current[
              props.transaction.category ? props.transaction.category[0] : ""
            ]
          }
          width={36}
        />

        <div className="flex-start flex h-full flex-col justify-center truncate">
          <p className="truncate text-base sm:text-lg">
            {props.transaction.name}
          </p>
          <p className="h-4 truncate text-xs font-light text-zinc-400 sm:h-5 sm:text-sm">
            {props.transaction.merchant_name}
          </p>
        </div>
      </div>

      <div className="flex h-fit min-w-fit items-center gap-x-1">
        <div
          className={`flex gap-x-1 text-base sm:text-lg ${
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
