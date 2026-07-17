import type { Tx } from "@/types/tx";

import Decimal from "decimal.js";
import { getCatStyle } from "lib/domain/cat";
import useAutoLoadUser from "lib/hooks/useAutoLoadUser";

interface Props {
  onInteraction: () => void;
  tx: Tx;
}
const TxCard = (props: Props) => {
  const { user: appUser, isLoading } = useAutoLoadUser();

  const splitAmount =
    isLoading && appUser
      ? props.tx.splitTxArray.find((split) => split.ownerId === appUser.id)
          ?.amount
      : "0";
  const displayedAmount = new Decimal(splitAmount ?? props.tx.amount).negated();

  return (
    <button
      type="button"
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-start hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-200"
      onClick={props.onInteraction}
    >
      <div className="flex w-full justify-between gap-x-3 truncate">
        <div className="flex h-full flex-start justify-center gap-x-2 truncate">
          <p className="truncate text-base sm:text-lg">{props.tx.name}</p>
        </div>

        <div
          className={`flex items-center gap-x-1 font-light text-base sm:text-lg ${
            new Decimal(props.tx.amount).isPositive() ? "" : "text-green-300"
          }`}
        >
          {props.tx.splitTxArray.length > 1 && (
            <span className="icon-[lucide--split] h-4 w-4 text-zinc-400" />
          )}
          <div>{displayedAmount.toString()}</div>
          <div>{props.tx.isoCurrencyCode || "US"}</div>
        </div>
      </div>

      <div className="flex h-fit w-full justify-between gap-x-1">
        <p className="font-light text-xs text-zinc-400">
          {props.tx.authorizedDatetime.toLocaleTimeString()}
        </p>

        <div
          className="no-scrollbar flex gap-x-1 overflow-x-auto overscroll-none"
          // scroll horizontally on mouse wheel
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY * 0.5;
          }}
        >
          {props.tx.catArray.map((cat) => (
            <div
              key={cat.id}
              className={`flex min-w-max gap-x-1 rounded-full p-2 ${getCatStyle(cat.primary, cat.detailed).border} ${getCatStyle(cat.primary, cat.detailed).textColor}`}
            >
              <span
                className={`${getCatStyle(cat.primary, cat.detailed).icon} ${getCatStyle(cat.primary, cat.detailed).textColor} w-4`}
              />
              <p className="font-light text-xs">
                {getCatStyle(cat.primary, cat.detailed).name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
};

export default TxCard;
