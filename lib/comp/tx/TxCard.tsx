import Image from "next/image";
import React from "react";

import { getCatStyle } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { FullTx } from "@/util/types";

interface Props {
  tx: FullTx;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const TxCard = (props: Props) => {
  const allUsers = trpc.user.getAll.useQuery(undefined, {
    staleTime: Infinity,
  });

  const appUser = allUsers.data?.[0];
  const setTxOnModal = useTxStore((state) => state.setTxOnModal);

  const splitAmount = props.tx.splitArray
    .find((split) => split.userId === appUser?.id)
    ?.catArray.reduce((total, cat) => parseMoney(total + cat.amount), 0);

  return (
    <section
      className="flex h-fit w-full flex-col justify-between gap-x-4 gap-y-1 rounded-md bg-zinc-800 px-3 py-2 text-start outline outline-1 outline-zinc-700 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-200"
      onClick={() => {
        props.setShowModal(true);
        setTxOnModal(props.tx);
      }}
    >
      <section className={`flex w-full justify-between gap-x-4 truncate`}>
        <div className="flex-start flex h-full justify-center gap-x-2 truncate">
          <p className="truncate text-base font-semibold sm:text-lg">
            {props.tx.name}
          </p>
        </div>

        <div
          className={`flex items-center gap-x-1 text-base sm:text-lg ${
            props.tx.amount > 0 ? "" : "text-green-300"
          }`}
        >
          {props.tx.splitArray.length > 1 && (
            <span className="icon-[lucide--split] h-4 w-4 text-zinc-400" />
          )}
          <div>{splitAmount ? splitAmount * -1 : props.tx.amount * -1}</div>
          <div>{props.tx.iso_currency_code}</div>
        </div>
      </section>

      <section className="flex h-fit w-full justify-between gap-x-1">
        <p className="text-xs text-zinc-400">{props.tx.datetime || "12:34"}</p>

        <div
          className="no-scrollbar flex gap-x-1 overflow-x-auto overscroll-none"
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY * 0.5;
          }}
        >
          {props.tx.splitArray[0].catArray.map((cat, index) => (
            <div
              key={index}
              className={`flex min-w-max gap-x-1 rounded-full p-2 text-zinc-800 ${
                getCatStyle(cat.nameArray).bgColor
              }`}
            >
              {props.tx.counterparties &&
              props.tx.counterparties[0]?.logo_url ? (
                <Image
                  className="rounded-full"
                  src={props.tx.counterparties[0].logo_url}
                  alt=""
                  width={16}
                  height={16}
                />
              ) : (
                <span className={getCatStyle(cat.nameArray).icon + " w-4"} />
              )}
              <p className="text-xs">{cat.nameArray.at(-1)}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default TxCard;
