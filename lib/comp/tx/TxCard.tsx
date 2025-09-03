import { getCatStyle } from "@/util/cat";
import useAppUser from "@/util/useAppUser";

import type { TxInDB } from "@/types/tx";

interface Props {
  onInteraction: () => void;
  tx: TxInDB;
}
const TxCard = (props: Props) => {
  const { appUser } = useAppUser();

  const splitAmount = props.tx.splitArray.find(
    (split) => split.userId === appUser?.id,
  )?.amount;

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
            props.tx.amount > 0 ? "" : "text-green-300"
          }`}
        >
          {props.tx.splitArray.length > 1 && (
            <span className="icon-[lucide--split] h-4 w-4 text-zinc-400" />
          )}
          <div>{splitAmount ? splitAmount * -1 : props.tx.amount * -1}</div>
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
              className={`flex min-w-max gap-x-1 rounded-full p-2 ${getCatStyle(cat.nameArray).border} ${getCatStyle(cat.nameArray).textColor}`}
            >
              <span
                className={`${getCatStyle(cat.nameArray).icon} ${getCatStyle(cat.nameArray).textColor} w-4`}
              />
              <p className="font-light text-xs">{cat.name.at(-1)}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default TxCard;
