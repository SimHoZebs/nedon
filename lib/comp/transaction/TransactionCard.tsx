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

const icon: {
  [key: string]: {
    icon: string;
    color: string;
  };
} = {
  Travel: { icon: "mdi:car-outline", color: "bg-yellow-300" },
  Taxi: { icon: "bx:taxi", color: "bg-yellow-300" },
  "Fast Food": { icon: "mdi:food", color: "bg-red-300" },
  "Food and Drink": {
    icon: "fluent:food-24-regular",
    color: "bg-blue-300",
  },
  "Airlines and Aviation Services": {
    icon: "mdi:airplane",
    color: "bg-teal-300",
  },
  "Coffee Shop": { icon: "mdi:coffee", color: "bg-orange-300" },
  Shops: { icon: "mdi:shopping-outline", color: "bg-green-300" },
  Payment: { icon: "mdi:exchange", color: "bg-green-300" },
  Transfer: { icon: "mdi:exchange", color: "bg-green-300" },
  "Gyms and Fitness Centers": {
    icon: "mingcute:fitness-line",
    color: "bg-green-300",
  },
  Recreation: {
    icon: "material-symbols:relax-outline",
    color: "bg-green-300",
  },
};

const TransactionCard = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const category = props.transaction.category;

  const splitAmount = props.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser?.id
  )?.amount;
  console.log(icon["Misc"]);

  return (
    <div
      className="flex h-[64px] w-full justify-between gap-x-4 rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className={`flex w-fit items-center gap-x-2 truncate sm:gap-x-4`}>
        <Icon
          className={`rounded-full bg-zinc-400 p-2 text-zinc-800 ${
            category && icon[category[category.length - 1]]?.color
          }`}
          icon={
            (category && icon[category[category.length - 1]]?.icon) ||
            "mdi:shape-outline"
          }
          width={30}
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
