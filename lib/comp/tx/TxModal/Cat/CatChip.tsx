import { trpc } from "@/util/trpc";

import { isSavedCat, type UnsavedCat } from "@/types/cat";

import { Prisma } from "@prisma/client";
import { getCatStyle } from "lib/domain/cat";
import { useTxStore } from "lib/store/txStore";
import type React from "react";

type Props = {
  cat: UnsavedCat;
  index: number;
  onCatChipClick: (
    e:
      | React.MouseEvent<HTMLDivElement, MouseEvent>
      | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
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

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group flex items-center gap-x-1 rounded-lg p-2 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-300 sm:text-sm ${
          props.isEditTarget && "animate-pulse bg-zinc-700"
        } `}
        onKeyDown={(e) => {
          props.onCatChipClick(e);
        }}
        onClick={(e) => props.onCatChipClick(e)}
      >
        <span
          className={`flex h-6 w-6 p-1 ${
            getCatStyle(props.cat.nameArray)?.textColor
          } ${
            getCatStyle(props.cat.nameArray)?.icon ||
            "icon-[mdi--shape-plus-outline]"
          } `}
        />

        <div className={"group flex h-full flex-col items-start text-zinc-300"}>
          <div className="flex w-full justify-between gap-x-2">
            <p className={props.isEditTarget ? "animate-pulse" : "font-light"}>
              {props.cat.nameArray.at(-1)}
            </p>

            {
              //not using unsavedCatArray as this should only appear when there is more than one SAVED cat.
              tx && tx.catArray.length > 1 && (
                <button
                  type="button"
                  aria-label="delete category"
                  className="h-4 w-4"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!props.cat.id) {
                      console.error(
                        "Unable to delete cat; this cat does not exist in db.",
                      );
                      return;
                    }
                    const tmpCatArray = structuredClone(catArray);
                    tmpCatArray.splice(props.index, 1);

                    if (!isSavedCat(tmpCatArray)) {
                      console.error(
                        "Unable to delete cat; One or more cat in array are ClientSide.",
                        tmpCatArray,
                      );
                      return;
                    }

                    await deleteCat.mutateAsync({
                      id: props.cat.id,
                    });
                    queryClient.tx.invalidate();
                  }}
                >
                  <span className="icon-[iconamoon--close-fill] hidden h-4 w-4 rounded-full text-zinc-400 outline-1 hover:text-pink-400 group-hover:block" />
                </button>
              )
            }
          </div>

          {props.isMultiCat && (
            <p
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              ${" "}
              <input
                className="w-14 bg-zinc-800 group-hover:bg-zinc-700"
                type="number"
                min={0}
                step={0.01}
                value={props.cat.amount.toNumber()}
                onFocus={() => props.setIsManaging(true)}
                onChange={(e) => {
                  if (!tx) {
                    console.error("some error");
                    return;
                  }

                  const valueToNum = Number.parseFloat(e.target.value) || 0;
                  const flooredAmount = Math.min(
                    tx.amount.toNumber(),
                    Math.max(0, valueToNum),
                  );
                  const tmpCatArray = structuredClone(catArray);
                  tmpCatArray[props.index].amount = new Prisma.Decimal(
                    flooredAmount,
                  );
                  setCatArray(tmpCatArray);
                }}
              />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatChip;
