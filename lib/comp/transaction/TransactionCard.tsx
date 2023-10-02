import { Icon } from "@iconify-icon/react";
import Image from "next/image";
import React from "react";

import { getCategoryStyle } from "@/util/category";
import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import { useTransactionStore } from "@/util/transactionStore";
import { FullTransaction } from "@/util/types";

interface Props {
  transaction: FullTransaction;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const TransactionCard = (props: Props) => {
  const appUser = useStore((state) => state.appUser);
  const setTransactionOnModal = useTransactionStore(
    (state) => state.setTransactionOnModal,
  );

  const splitAmount = props.transaction.splitArray
    .find((split) => split.userId === appUser?.id)
    ?.categoryArray.reduce(
      (total, category) => parseMoney(total + category.amount),
      0,
    );

  return (
    <div
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-md bg-zinc-800 px-3 py-2 text-start outline outline-1 outline-zinc-700 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-200"
      onClick={() => {
        props.setShowModal(true);
        setTransactionOnModal(props.transaction);
      }}
    >
      <div className={`flex w-full justify-between gap-x-4 truncate`}>
        <div className="flex-start flex h-full gap-x-2 justify-center truncate">
          <p className="truncate text-base font-semibold sm:text-lg">
            {props.transaction.name}
          </p>
        </div>

        <div
          className={`flex items-center gap-x-1 text-base sm:text-lg ${
            props.transaction.amount > 0 ? "" : "text-green-300"
          }`}
        >
          {props.transaction.splitArray.length > 1 && (
            <Icon icon="lucide:split" width={16} className="text-zinc-400" />
          )}
          <div>
            {splitAmount ? splitAmount * -1 : props.transaction.amount * -1}
          </div>
          <div>{props.transaction.iso_currency_code}</div>
        </div>
      </div>

      <div className="flex h-fit w-full justify-between gap-x-1">
        <p className="text-xs text-zinc-400">
          {props.transaction.datetime || "12:34"}
        </p>

        <div
          className="no-scrollbar flex gap-x-1 overflow-x-auto overscroll-none"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY * 0.5;
          }}
        >
          {props.transaction.splitArray[0].categoryArray.map(
            (category, index) => (
              <div
                key={index}
                className={`flex min-w-max gap-x-1 rounded-full p-2 text-zinc-800 ${
                  getCategoryStyle(category.nameArray).bgColor
                }`}
              >
                {props.transaction.counterparties &&
                props.transaction.counterparties[0]?.logo_url ? (
                  <Image
                    className="rounded-full"
                    src={props.transaction.counterparties[0].logo_url}
                    alt=""
                    width={16}
                    height={16}
                  />
                ) : (
                  <Icon
                    icon={getCategoryStyle(category.nameArray).icon}
                    width={16}
                  />
                )}
                <p className="text-xs">{category.nameArray.at(-1)}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
