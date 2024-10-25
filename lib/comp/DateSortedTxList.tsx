import type React from "react";

import getAppUser from "@/util/getAppUser";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import type { TxInDB } from "@/types/tx";

import { H2, H3 } from "./Heading";
import TxCard from "./tx/TxCard";

interface Props {
  sortedTxArray: TxInDB[][][][];
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  YMD?: number[];
  rangeFormat?: "year" | "month" | "date" | "all";
}

const DateSortedTxList = (props: Props) => {
  const { appUser } = getAppUser();

  const txArray = trpc.tx.getAll.useQuery(
    { id: appUser ? appUser.id : "" },
    { staleTime: 3600000, enabled: appUser?.hasAccessToken },
  );
  const setTxOnModal = useTxStore((state) => state.setTxOnModal);
  const setTxOnModalIndex = useTxStore((state) => state.setTxOnModalIndex);

  const onInteraction = (tx: TxInDB, index: number[]) => {
    if (!props.setShowModal) {
      console.log("props.setShowModal not implemented");
      return;
    }
    const [j, k, l] = index;
    const [y, m, d] = props.YMD || [0, 0, 0];

    switch (props.rangeFormat) {
      case "year":
        setTxOnModalIndex([y, j, k, l]);
        break;
      case "month":
        setTxOnModalIndex([y, m, k, l]);
        break;
      case "date":
        setTxOnModalIndex([j, m, d, l]);
        break;
      default:
        console.error("rangeFormat not implemented");
    }

    props.setShowModal(true);
    setTxOnModal(tx);
  };

  return txArray.isLoading ? (
    <ol className="flex h-fit w-full flex-col gap-y-3">
      <H2 className="animate-pulse">Loading...</H2>

      {Array(10)
        .fill(0)
        .map((i) => (
          <li
            key={Math.random() * (i + 1)}
            className="h-20 w-full animate-pulse rounded-lg bg-zinc-800"
          />
        ))}
    </ol>
  ) : (
    <ol className="no-scrollbar flex h-full w-full max-w-md flex-col items-center gap-y-2 overflow-y-scroll px-1">
      {props.sortedTxArray.map((year) =>
        year.map((month, j) => (
          <li
            key={Math.random() * (j + 1)}
            className="w-full flex-col gap-y-1 pb-1"
          >
            <ol className="flex flex-col gap-y-1">
              {month.map((day, k) => (
                <li
                  className="flex w-full flex-col gap-y-1"
                  key={Math.random() * (k + 1)}
                >
                  <H3>{day[0]?.date.slice(8)}</H3>
                  <ol className="flex flex-col">
                    {day.length === 0 ? (
                      <div>
                        No tx this month! That{"'"}s a good thing, right?
                      </div>
                    ) : (
                      day.map(
                        (tx, l) =>
                          tx && (
                            <TxCard
                              onInteraction={() => onInteraction(tx, [j, k, l])}
                              tx={tx}
                              key={tx.plaidId}
                            />
                          ),
                      )
                    )}
                  </ol>
                </li>
              ))}
            </ol>
          </li>
        )),
      )}
    </ol>
  );
};

export default DateSortedTxList;
