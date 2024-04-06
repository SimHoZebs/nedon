import React, { useRef, useState } from "react";

import { ActionBtn, Button } from "@/comp/Button";
import { H3 } from "@/comp/Heading";

import { emptyCat, mergeCatArray } from "@/util/cat";
import parseMoney from "@/util/parseMoney";
import { calcSplitAmount } from "@/util/split";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { isSplitInDB } from "@/util/types";

import CatChip from "./CatChip";
import CatPicker from "./CatPicker";

const offScreen = { x: -800, y: -800 };

const Cat = () => {
  const unsavedSplitArray = useTxStore((state) => state.unsavedSplitArray);
  const setUnsavedSplitArray = useTxStore(
    (state) => state.setUnsavedSplitArray,
  );
  const tx = useTxStore((state) => state.txOnModal);
  const refreshDBData = useTxStore((state) => state.refreshDBData);
  const catPickerRef = useRef<HTMLDivElement>(null);
  const upsertManyCat = trpc.cat.upsertMany.useMutation();

  const unsavedMergedCatArray = mergeCatArray(unsavedSplitArray);

  //Indicator for if (undefined) and which (number) cat is being edited. 'if' is needed for CatChip.tsx to highlight the editing cat.
  const [editingMergedCatIndex, setEditingMergedCatIndex] = useState<number>();
  const [isManaging, setIsManaging] = useState(false);
  const queryClient = trpc.useUtils();

  //Picker always exists; Modal.tsx hides it with overflow-hidden
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>(offScreen);

  const updatedSplitAmount = parseMoney(
    unsavedSplitArray.reduce(
      (amount, split) => amount + calcSplitAmount(split),
      0,
    ),
  );

  const txAmount = tx?.amount || 0;

  const isWrongSplit =
    updatedSplitAmount !== txAmount && unsavedSplitArray.length > 0;

  return (
    <div className="flex gap-y-1">
      <div className="flex flex-col gap-y-1">
        <div className="relative flex w-full flex-wrap items-center gap-2 ">
          {unsavedMergedCatArray.map((cat, index) => (
            <CatChip
              key={cat.id}
              index={index}
              isManaging={isManaging}
              setIsManaging={setIsManaging}
              isMultiCat={unsavedMergedCatArray.length > 1}
              isEditing={editingMergedCatIndex === index}
              mergedCat={
                editingMergedCatIndex === index
                  ? unsavedMergedCatArray[index]
                  : cat
              }
              findAndSetPickerPosition={(e) => {
                setEditingMergedCatIndex(index);

                //pickerOffset is sometimes undefined if it's outside
                const pickerOffsets =
                  catPickerRef.current?.getBoundingClientRect();
                if (!pickerOffsets) {
                  console.error;
                  `pickerOffsets is undefined. catPickerRef is: ${catPickerRef.current}`;

                  return;
                }
                const offsets = e.currentTarget.getBoundingClientRect();
                setPickerPosition({
                  x: offsets.right - pickerOffsets?.width,
                  y: offsets.bottom + 8,
                });
              }}
            />
          ))}

          <Button
            className="gap-x-1 rounded-lg text-indigo-300 hover:bg-zinc-700 hover:text-indigo-200"
            onClickAsync={async (e) => {
              setIsManaging(true);

              const mergedCatArrayClone = structuredClone(
                unsavedMergedCatArray,
              );

              mergedCatArrayClone.push(
                emptyCat({ amount: 0, splitId: undefined }),
              );

              const newCat = emptyCat({
                amount: 0,
                splitId: undefined,
              });

              const updatedSplitArray = structuredClone(unsavedSplitArray).map(
                (split) => {
                  split.catArray.push(newCat);
                  return split;
                },
              );

              setUnsavedSplitArray(updatedSplitArray);

              //The index is referenced from the clone instead of the react state as they are identical and the react state wouldn't have updated yet (See: batch state update)
              setEditingMergedCatIndex(mergedCatArrayClone.length - 1);

              //pickerOffset is sometimes undefined if it's outside
              const pickerOffsets =
                catPickerRef.current?.getBoundingClientRect();
              if (!pickerOffsets) {
                console.error(
                  `pickerOffsets is undefined. catPickerRef is: ${catPickerRef.current}`,
                );
                return;
              }

              const clickPositionOffsets =
                e.currentTarget.getBoundingClientRect();

              setPickerPosition({
                x: clickPositionOffsets.right - pickerOffsets?.width,
                y: clickPositionOffsets.bottom + 8,
              });
            }}
          >
            <span className="icon-[mdi--plus]" />
            Add
          </Button>
        </div>

        {isManaging && (
          <div className="flex gap-x-2">
            <ActionBtn
              disabled={isWrongSplit}
              onClickAsync={async () => {
                const splitArrayClone = structuredClone(unsavedSplitArray);
                const targetSplit = splitArrayClone[0];

                if (!isSplitInDB(targetSplit)) {
                  console.error();
                  return;
                }

                const updatedSplit = await upsertManyCat.mutateAsync({
                  catArray: targetSplit.catArray,
                });

                splitArrayClone[0] = updatedSplit;

                refreshDBData(splitArrayClone);
                setIsManaging(false);
                queryClient.tx.invalidate();
              }}
            >
              <span className="icon-[mdi--check]" />
            </ActionBtn>

            <ActionBtn
              variant="negative"
              onClick={() => {
                setIsManaging(false);
                if (!tx) {
                  console.error("Can't reset splitArray. tx is undefined");
                  return;
                }
                setUnsavedSplitArray(tx.splitArray);
              }}
            >
              <span className="icon-[iconamoon--close-fill]" />
            </ActionBtn>
          </div>
        )}

        {tx && (
          <CatPicker
            ref={catPickerRef}
            unsavedMergedCatArray={unsavedMergedCatArray}
            //Fallback to 0 for initial boundingClient size.
            editingMergedCatIndex={editingMergedCatIndex || 0}
            position={pickerPosition}
            closePicker={() => {
              setEditingMergedCatIndex(undefined);
              setPickerPosition(offScreen);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Cat;
