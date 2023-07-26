import React from "react";

import { useStoreState } from "@/util/store";
import { Icon } from "@iconify-icon/react";
import { FullTransaction } from "@/util/types";
import { getCategoryStyle, mergeCategoryArray } from "@/util/category";

interface Props {
  transaction: FullTransaction;
  button: () => void;
}
const TransactionCard = (props: Props) => {
  const { appUser } = useStoreState((state) => state);

  //TODO: fix this later
  const splitAmount = props.transaction.splitArray
    .find((split) => split.userId === appUser?.id)
    ?.categoryArray.reduce((total, category) => total + category.amount, 0);

  return (
    <div
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-md bg-zinc-800 p-2 text-start hover:cursor-pointer hover:bg-zinc-700"
      onClick={props.button}
    >
      <div className={`flex w-full justify-between gap-x-4 truncate`}>
        <div className="flex-start flex h-full flex-col justify-center truncate">
          <p className="truncate text-base font-semibold sm:text-lg">
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

      <div className="flex h-fit w-full justify-between gap-x-1">
        <p className="text-sm text-zinc-400">
          {props.transaction.datetime || "12:34"}
        </p>

        <div
          className="no-scrollbar flex gap-x-1 overflow-x-auto overscroll-none"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY * 0.5;
          }}
        >
          {mergeCategoryArray(props.transaction.splitArray).map(
            (category, index) => (
              <div
                key={index}
                className={`flex min-w-max gap-x-1 rounded-full p-2 text-zinc-800 ${
                  getCategoryStyle(category.nameArray)?.bgColor || "bg-zinc-400"
                }`}
              >
                <Icon
                  icon={
                    getCategoryStyle(category.nameArray)?.icon ||
                    "mdi:shape-outline"
                  }
                  width={16}
                />
                <p className="text-xs">
                  {category.nameArray[category.nameArray.length - 1]}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
