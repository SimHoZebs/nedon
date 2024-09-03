import { includes } from "cypress/types/lodash";
import type React from "react";

import { getCatStyle } from "@/util/cat";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { type CatClientSide, isCatArrayInDB } from "@/util/types";

type Props = {
  cat: CatClientSide;
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
  const unsavedCatArray = useTxStore((store) => store.unsavedCatArray);
  const setUnsavedCatArray = useTxStore((store) => store.setUnsavedCatArray);
  const refreshDBData = useTxStore((store) => store.refreshTxModalData);
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
          className={`flex h-6 w-6 rounded-full p-1 ${
            getCatStyle(props.cat.nameArray)?.textColor
          } ${
            getCatStyle(props.cat.nameArray)?.icon ||
            "icon-[mdi--shape-plus-outline]"
          } `}
        />

        <div className={"group flex h-full flex-col items-start text-zinc-300"}>
          <div className="flex w-full justify-between gap-x-2">
            <p className={props.isEditTarget ? "animate-pulse" : ""}>
              {props.cat.name}
              {/* {props.cat.nameArray.at(-1)} */}
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
                    const tmpCatArray = structuredClone(unsavedCatArray);
                    tmpCatArray.splice(props.index, 1);

                    if (!isCatArrayInDB(tmpCatArray)) {
                      console.error(
                        "Unable to delete cat; One or more cat in array are ClientSide.",
                        tmpCatArray,
                      );
                      return;
                    }

                    refreshDBData(tmpCatArray);
                    await deleteCat.mutateAsync({
                      id: props.cat.id,
                    });
                    queryClient.tx.invalidate();
                  }}
                >
                  <span className="icon-[iconamoon--close-fill] hidden h-4 w-4 rounded-full text-zinc-400 outline outline-1 hover:text-pink-400 group-hover:block" />
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
                  const tmpCatArray = structuredClone(unsavedCatArray);
                  tmpCatArray[props.index].amount = flooredAmount;
                  setUnsavedCatArray(tmpCatArray);
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
