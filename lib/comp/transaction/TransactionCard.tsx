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
  //TODO: Need to be redesigned to fit multiple categories - probably small text or icons instead
  const splitAmount = props.transaction.splitArray?.find(
    (split) =>
      split.transactionId === props.transaction.transaction_id &&
      split.userId === appUser?.id
  )?.amount;

  const thisCategoryStyle = (index: number) => {
    const lastCategory =
      props.transaction.categoryTreeArray[index]?.nameArray.slice(-1)[0];
    return categoryStyle[lastCategory];
  };

  return (
    <div
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className={`flex w-full justify-between gap-x-4 truncate`}>
        <div className="flex-start flex h-full flex-col justify-center truncate">
          <p className="truncate font-semibold sm:text-lg">
            {props.transaction.name}
          </p>
        </div>

        <div
          className={`flex items-center gap-x-1 text-base sm:text-lg ${
            props.transaction.amount > 0 ? "" : "text-green-300"
          }`}
        >
          {splitAmount && (
            <Icon icon="lucide:split" width={16} className="text-zinc-400" />
          )}
          <div>
            {splitAmount ? splitAmount * -1 : props.transaction.amount * -1}
          </div>
          <div>{props.transaction.iso_currency_code}</div>
        </div>
      </div>

      <div className="flex h-fit w-full flex-col gap-x-1">
        <div
          className="no-scrollbar flex gap-x-1 overflow-x-auto overscroll-none"
          onWheel={(e) => {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY * 0.5;
          }}
        >
          {props.transaction.categoryTreeArray.map((tree, index) => (
            <div
              key={index}
              className={`flex min-w-max gap-x-1 rounded-full p-2 text-zinc-800 ${
                thisCategoryStyle(index)?.bgColor || "bg-zinc-400"
              }`}
            >
              <Icon
                icon={thisCategoryStyle(index)?.icon || "mdi:shape-outline"}
                width={16}
              />
              <p className="text-xs">
                {tree.nameArray[tree.nameArray.length - 1]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
