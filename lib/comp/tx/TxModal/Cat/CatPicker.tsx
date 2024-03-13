import React, {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useState,
} from "react";

import { emptyCat } from "@/util/cat";
import catStyleArray from "@/util/catStyle";
import getAppUser from "@/util/getAppUser";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import type { MergedCat, SplitInDB, TreedCat } from "@/util/types";

interface Props {
  unsavedMergedCatArray: MergedCat[];
  editingMergedCatIndex: number;
  closePicker: () => void;
  position: { x: number; y: number };
}

const CatPicker = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const createCat = trpc.cat.create.useMutation();
    const createSplit = trpc.split.create.useMutation();
    const upsertManySplit = trpc.split.upsertMany.useMutation();
    const createTx = trpc.tx.create.useMutation();
    const catOptionArray = trpc.getCatOptionArray.useQuery(undefined, {
      staleTime: Number.POSITIVE_INFINITY,
    });
    const queryClient = trpc.useUtils();

    const { appUser } = getAppUser();
    const tx = useTxStore((state) => state.txOnModal);
    const refreshDBData = useTxStore((state) => state.refreshDBData);
    const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
    const setUnsavedSplitArray = useTxStore(
      (state) => state.setUnsavedSplitArray,
    );
    const screenType = useStore((state) => state.screenType);
    const [unsavedNameArray, setCurrentNameArray] = useState<string[]>([]);
    const [currentOptionArray, setCurrentOptionArray] = useState<TreedCat[]>(
      [],
    );

    const editingMergedCat =
      props.unsavedMergedCatArray[props.editingMergedCatIndex];

    const resetPicker = () => {
      setCurrentNameArray([]);

      if (!catOptionArray.data) {
        console.error(
          "Can't reset picker. catOptionArray is undefined. How did you get here?",
        );
        return;
      }
      setCurrentOptionArray(catOptionArray.data);
    };

    const createCatForManySplit = async (nameArray: string[]) => {
      if (!appUser || !tx) {
        console.error("appUser or txOnModal or tx is undefined.");
        return;
      }

      if (!tx.id) {
        if (props.editingMergedCatIndex === undefined) {
          console.error("editingMergedCatIndex is undefined.");
          return;
        }

        const split = structuredClone(unsavedSplitArray[0]);
        split.catArray[props.editingMergedCatIndex] = emptyCat({
          nameArray,
          splitId: split.id,
          amount: 0,
        });

        const txDBData = await createTx.mutateAsync({
          userId: appUser.id,
          txId: tx.transaction_id,
          splitArray: [split],
        });

        refreshDBData(txDBData);

        return;
      }

      const updatedSplitArray = unsavedSplitArray.map((unsavedSplit) => {
        const split = structuredClone(unsavedSplit);
        split.catArray[split.catArray.length - 1] = emptyCat({
          nameArray,
          splitId: split.id,
          amount: 0,
        });

        return split;
      });

      refreshDBData(updatedSplitArray);

      const dbUpdatedSplitArray = await Promise.all(
        updatedSplitArray.map(async (updatedSplit) => {
          if (updatedSplit.id === null) {
            //tx.id boolean was checked before
            const newSplit = await createSplit.mutateAsync({
              txId: tx.id!,
              split: updatedSplit,
            });

            return newSplit;
          }

          const updatedSplitClone = structuredClone(updatedSplit);
          const newCat = await createCat.mutateAsync({
            splitId: updatedSplit.id!, // never null because of the if check
            amount: 0,
            nameArray: nameArray,
          });

          updatedSplitClone.catArray[updatedSplit.catArray.length - 1] = newCat;

          return updatedSplitClone as SplitInDB;
        }),
      );

      refreshDBData(dbUpdatedSplitArray);
    };

    const updateManyCatNameArray = async (updatedNameArray: string[]) => {
      if (!tx) return console.error("tx is undefined.");

      if (!tx.id) {
        const txDBData = await createTx.mutateAsync({
          userId: appUser!.id,
          txId: tx.transaction_id,
          splitArray: unsavedSplitArray.map((split) => ({
            ...split,
            catArray: split.catArray.map((cat) => ({
              ...cat,
              nameArray: updatedNameArray,
            })),
          })),
        });

        refreshDBData(txDBData);
        return;
      }

      if (props.editingMergedCatIndex === undefined) {
        console.error("editingMergedCatIndex is undefined.");
        return;
      }

      const updatedSplitArray = unsavedSplitArray.map((unsavedSplit) => {
        const updatedSplit = structuredClone(unsavedSplit);

        updatedSplit.catArray[props.editingMergedCatIndex].nameArray =
          updatedNameArray;

        return updatedSplit;
      });

      refreshDBData(updatedSplitArray);
      const dbUpdatedTx = await upsertManySplit.mutateAsync({
        txId: tx.id,
        splitArray: updatedSplitArray,
      });
      refreshDBData(dbUpdatedTx);
    };

    /**
     *
     * @param clickedTreedCat  if the cat is assigned by click instead of the "save" button.
     */
    const applyChangesToCat = async (clickedTreedCat?: TreedCat) => {
      const updatedMergedCat = structuredClone(editingMergedCat);
      const updatedNameArray = structuredClone(unsavedNameArray);

      if (clickedTreedCat) {
        updatedNameArray.push(clickedTreedCat.name);
      }
      updatedMergedCat.nameArray = updatedNameArray;

      //The only diff between categories inDB and not inDB
      if (editingMergedCat.nameArray.length === 0) {
        await createCatForManySplit(updatedMergedCat.nameArray);
      } else {
        await updateManyCatNameArray(updatedMergedCat.nameArray);
      }

      queryClient.tx.invalidate();
    };

    useEffect(() => {
      if (!catOptionArray.data) {
        catOptionArray.status === "pending"
          ? console.debug(
              "Can't sync currentOptionArray. catOptionArray is loading.",
            )
          : console.error(
              "Can't sync currentOptionArray. fetching catOptionArray failed.",
            );

        return;
      }

      const filteredOptionArray = catOptionArray.data.filter(
        (option) =>
          !props.unsavedMergedCatArray.find(
            (unsavedCat) => unsavedCat.nameArray.at(-1) === option.name,
          ),
      );

      setCurrentOptionArray(filteredOptionArray);
    }, [
      catOptionArray.data,
      catOptionArray.status,
      props.unsavedMergedCatArray,
    ]);

    return catOptionArray.data ? (
      <div
        ref={ref}
        className={
          "absolute left-0 flex max-h-[50vh] w-full flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900 sm:w-96 "
        }
        onClick={(e) => e.stopPropagation()}
        style={
          screenType === "desktop"
            ? { top: props.position.y, left: props.position.x }
            : { top: props.position.y, left: 0 }
        }
      >
        <div className="flex w-full justify-between px-2 py-1">
          <div className="flex w-fit items-center">
            {unsavedNameArray.length > 0 && (
              <button
                aria-label="back"
                className="flex"
                onClick={() => {
                  if (!tx)
                    return console.error(
                      "Can't reset unsavedSplitArray. tx is undefined.",
                    );
                  resetPicker();
                }}
              >
                <span className="icon-[mdi--chevron-left] h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex gap-x-2 ">
            <button
              className="text-indigo-300 hover:text-indigo-400"
              onClick={async () => {
                if (editingMergedCat.id === null) {
                  await applyChangesToCat();
                  resetPicker();
                  props.closePicker();
                }
              }}
            >
              save
            </button>
            <button
              className="text-pink-400 hover:text-pink-500"
              onClick={(e) => {
                e.stopPropagation();
                if (!tx)
                  return console.error(
                    "Can't reset unsavedSplitArray. tx is undefined.",
                  );
                setUnsavedSplitArray(tx.splitArray);
                resetPicker();
                props.closePicker();
              }}
            >
              cancel
            </button>
          </div>
        </div>

        <hr className="w-full border-zinc-700" />

        <div className="grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 pb-1 pl-2 text-xs ">
          {currentOptionArray.map((cat, i) => (
            <button
              onClick={async () => {
                if (cat.subCatArray.length === 0) {
                  await applyChangesToCat(cat);
                  resetPicker();
                  props.closePicker();
                } else {
                  const updatedOptionArray = cat.subCatArray;

                  const filteredOptionArray = updatedOptionArray.filter(
                    (option) =>
                      !props.unsavedMergedCatArray.find(
                        (unsavedCat) =>
                          unsavedCat.nameArray.at(-1) === option.name,
                      ),
                  );

                  setCurrentOptionArray(filteredOptionArray);
                  setCurrentNameArray((prev) => [...prev, cat.name]);
                }
              }}
              key={i}
              className={
                "group my-1 mr-2 flex aspect-square flex-col items-center  justify-center gap-y-1  hyphens-auto rounded-lg border border-zinc-400 text-center hover:bg-zinc-700 hover:text-zinc-200"
              }
            >
              <span
                className={`h-6 w-6 ${
                  catStyleArray[cat.name]?.textColor ||
                  "text-zinc-500 group-hover:text-zinc-400"
                } ${
                  catStyleArray[cat.name]?.icon ||
                  "icon-[material-symbols--category-outline]"
                }`}
              />
              <p>{cat.name}</p>
              <p className="text-zinc-500 group-hover:text-zinc-400">
                {cat.subCatArray.length > 0 &&
                  cat.subCatArray.length + " subcategories"}
              </p>
            </button>
          ))}
        </div>
      </div>
    ) : null;
  },
);

CatPicker.displayName = "CatPicker";

export default CatPicker;
