import type { Cat } from "@prisma/client";
import type React from "react";

import { getCatStyle } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { type MergedCat, isCatInSplitInDB } from "@/util/types";

type Props = {
  mergedCat: MergedCat;
  index: number;
  findAndSetPickerPosition: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void;
  isMultiCat: boolean;
  isEditing: boolean;
  isManaging: boolean;
  setIsManaging: React.Dispatch<React.SetStateAction<boolean>>;
};

const CatChip = (props: Props) => {
  const tx = useTxStore((store) => store.txOnModal);
  const unsavedSplitArray = useTxStore((store) => store.unsavedSplitArray);
  const refreshDBData = useTxStore((store) => store.refreshDBData);
  const deleteManyCat = trpc.cat.deleteMany.useMutation();
  const queryClient = trpc.useUtils();
  const setUnsavedSplitArray = useTxStore(
    (store) => store.setUnsavedSplitArray,
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`group flex items-center gap-x-1 rounded-lg p-2 text-xs text-zinc-400 hover:cursor-pointer hover:bg-zinc-700 hover:text-zinc-300 sm:text-sm ${
          props.isEditing && "animate-pulse bg-zinc-700"
        } `}
        onClick={(e) => props.findAndSetPickerPosition(e)}
      >
        <span
          className={`flex h-6 w-6 rounded-full p-1 ${
            getCatStyle(props.mergedCat.nameArray)?.textColor
          } ${
            getCatStyle(props.mergedCat.nameArray)?.icon ||
            "icon-[mdi--shape-plus-outline]"
          }
`}
        />

        <div
          className={"group flex h-full flex-col items-start text-zinc-300 "}
        >
          <div className="flex w-full justify-between gap-x-2">
            <p className={props.isEditing ? "animate-pulse" : ""}>
              {props.mergedCat.nameArray.at(-1)}
            </p>

            {
              //not using unsavedSplitArray as this should only appear when there is more than one SAVED cat.
              tx && tx.splitArray[0].catArray.length > 1 && (
                <button
                  aria-label="Close"
                  className="h-4 w-4"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (!tx.id) {
                      console.error(
                        "Unable to delete cat; this tx does not exist in db.",
                      );
                      return;
                    }

                    const catToDeleteArray: Cat[] = [];
                    const updatedSplitArray = unsavedSplitArray.map((split) => {
                      const updatedCatArray = split.catArray.filter((cat) => {
                        if (
                          cat.nameArray.join() !==
                          props.mergedCat.nameArray.join()
                        ) {
                          return cat;
                        } else {
                          if (!isCatInSplitInDB(cat)) {
                            console.error(
                              "Can't add this cat to toDeleteArray. It does not have id. cat:",
                              cat,
                            );
                            return;
                          }

                          catToDeleteArray.push(cat);
                        }
                      });

                      return {
                        ...split,
                        catArray: updatedCatArray,
                      };
                    });

                    refreshDBData(updatedSplitArray);

                    deleteManyCat.mutateAsync({
                      catArray: catToDeleteArray,
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
            <p onClick={(e) => e.stopPropagation()}>
              ${" "}
              <input
                className="w-14 bg-zinc-800 group-hover:bg-zinc-700 "
                type="number"
                min={0}
                step={0.01}
                value={props.mergedCat.amount}
                onFocus={() => props.setIsManaging(true)}
                //on change, the other categories will have to reduce its contribution.
                //Changing value in categories mean changing the amount of cat in every contributor
                onChange={(e) => {
                  if (!tx) {
                    console.error("some error");
                    return;
                  }

                  const newValue = Number.parseFloat(e.target.value) || 0;

                  const changeAmount = parseMoney(
                    newValue - props.mergedCat.amount,
                  );

                  const splitArrayClone = structuredClone(unsavedSplitArray);

                  splitArrayClone[0].catArray[props.index].amount = parseMoney(
                    splitArrayClone[0].catArray[props.index].amount +
                      changeAmount,
                  );

                  setUnsavedSplitArray(splitArrayClone);
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
