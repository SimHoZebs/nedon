import React from "react";

import { useStoreState } from "../../util/store";
import { Icon } from "@iconify-icon/react";
import categoryStyle from "../../util/categoryStyle";
import { FullTransaction } from "../../util/types";

interface Props {
  transaction: FullTransaction;
  button: () => void;
}

const TransactionCard = (props: Props) => {
  const { appUser } = useStoreState((state) => state);
  const lastCategory =
    props.transaction.category?.[props.transaction.category.length - 1];

  const splitAmount = props.transaction.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser?.id,
  )?.amount;

  return (
    <div
      className="flex h-[64px] w-full justify-between gap-x-4 rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className={`flex w-fit items-center gap-x-2 truncate sm:gap-x-4`}>
        <Icon
          className={`rounded-full p-2 text-zinc-800 ${
            (lastCategory && categoryStyle[lastCategory]?.bgColor) ||
            "bg-zinc-400"
          }`}
          icon={
            (lastCategory && categoryStyle[lastCategory]?.icon) ||
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
