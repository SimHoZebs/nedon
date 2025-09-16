import type { Tx } from "@/types/tx";

import { Prisma } from "@prisma/client";
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
      : new Prisma.Decimal(0);

  return (
    <section
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-lg px-3 py-2 text-start hover:cursor-pointer hover:bg-zinc-800 hover:text-zinc-200"
      onKeyDown={props.onInteraction}
      onClick={props.onInteraction}
    >
      <section className="flex w-full justify-between gap-x-3 truncate">
        <div className="flex h-full flex-start justify-center gap-x-2 truncate">
          <p className="truncate text-base sm:text-lg">{props.tx.name}</p>
        </div>

        <div
          className={`flex items-center gap-x-1 font-light text-base sm:text-lg ${
            props.tx.amount.greaterThan(0) ? "" : "text-green-300"
          }`}
        >
          {props.tx.splitTxArray.length > 1 && (
            <span className="icon-[lucide--split] h-4 w-4 text-zinc-400" />
          )}
          <div>
            {splitAmount
              ? splitAmount.mul(-1).toNumber()
              : props.tx.amount.mul(-1).toNumber()}
          </div>
          <div>{props.tx.plaidTx?.iso_currency_code || "US"}</div>
        </div>
      </section>

      <section className="flex h-fit w-full justify-between gap-x-1">
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
      </section>
    </section>
  );
};

export default TxCard;
