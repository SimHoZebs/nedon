import { toMoney } from "@/util/money";
import { trpc } from "@/util/trpc";

import type { CatFormState } from "@/types/cat";

import { getCatStyle } from "lib/domain/cat";
import { useTxStore } from "lib/store/txStore";
import type React from "react";

type Props = {
  cat: CatFormState;
  index: number;
  onCatChipClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isMultiCat: boolean;
  isEditTarget: boolean;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
};

const CatChip = (props: Props) => {
  const tx = useTxStore((store) => store.txOnModal);
  const catArray = tx?.catArray || [];
  const setCatArray = useTxStore((store) => store.setCatArray);
  const queryClient = trpc.useUtils();
  const deleteCat = trpc.cat.delete.useMutation();

  const catStyle = getCatStyle(props.cat.primary, props.cat.detailed);
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group flex items-center gap-x-1 rounded-lg p-2 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-300 sm:text-sm ${
          props.isEditTarget && "animate-pulse bg-zinc-700"
        } `}
      >
        <button
          type="button"
          className="flex items-center gap-x-1 text-zinc-300"
          onClick={props.onCatChipClick}
        >
          <span
            className={`flex h-6 w-6 p-1 ${catStyle.textColor} ${catStyle.icon} `}
          />
          <span className={props.isEditTarget ? "animate-pulse" : "font-light"}>
            {getCatStyle(props.cat.primary, props.cat.detailed).name}
          </span>
        </button>

        {tx && tx.catArray.length > 1 && (
          <button
            type="button"
            aria-label="delete category"
            className="h-4 w-4"
            onClick={async () => {
              if (!props.cat.id) {
                console.error(
                  "Unable to delete cat; this cat does not exist in db.",
                );
                return;
              }
              const tmpCatArray = structuredClone(catArray);
              tmpCatArray.splice(props.index, 1);

              await deleteCat.mutateAsync({
                id: props.cat.id,
              });
              setCatArray(tmpCatArray);
              queryClient.tx.invalidate();
            }}
          >
            <span className="icon-[iconamoon--close-fill] hidden h-4 w-4 rounded-full text-zinc-400 outline-1 hover:text-pink-400 group-hover:block" />
          </button>
        )}

        {props.isMultiCat && (
          <label>
            ${" "}
            <input
              className="w-14 bg-zinc-800 group-hover:bg-zinc-700"
              type="number"
              min={0}
              step={0.01}
              value={props.cat.amount}
              onFocus={() => props.setIsManaging(true)}
              onChange={(e) => {
                if (!tx) {
                  console.error("some error");
                  return;
                }

                const valueToNum = Number.parseFloat(e.target.value) || 0;
                const flooredAmount = Math.min(
                  tx.amount,
                  Math.max(0, valueToNum),
                );
                const tmpCatArray = structuredClone(catArray);
                tmpCatArray[props.index].amount = toMoney(flooredAmount);
                setCatArray(tmpCatArray);
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default CatChip;
