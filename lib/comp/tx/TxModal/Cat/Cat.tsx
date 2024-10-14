import React, { useRef, useState } from "react";

import { ActionBtn, Button } from "@/comp/Button";

import { createNewCat } from "@/util/cat";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";

import type { CatClientSide } from "@/types/cat";

import CatChip from "./CatChip";
import CatPicker from "./CatPicker";

const offScreen = { x: -800, y: -800 };

const Cat = () => {
  const queryClient = trpc.useUtils();
  const setCatArray = useTxStore((state) => state.setCatArray);
  const tx = useTxStore((state) => state.txOnModal);
  const catPickerRef = useRef<HTMLDivElement>(null);
  const upsertManyCat = trpc.cat.upsertMany.useMutation();

  const catArray = tx?.catArray || [];

  //Indicator for if (undefined) and which (number) cat is being edited. 'if' is needed for CatChip.tsx to highlight the editing cat.
  const [editingCatIndex, setEditingMergedCatIndex] = useState<number>();
  const [isManaging, setIsManaging] = useState(false);

  //Picker always exists; Modal.tsx hides it with overflow-hidden
  const [pickerPosition, setPickerPosition] = useState<{
    x: number;
    y: number;
  }>(offScreen);

  return (
    <div className="flex gap-y-1">
      <div className="flex flex-col gap-y-1">
        <div className="relative flex w-full flex-wrap items-center gap-2">
          {catArray?.map((cat, index) => (
            <CatChip
              key={cat.id}
              index={index}
              isManaging={isManaging}
              setIsManaging={setIsManaging}
              isMultiCat={catArray.length > 1}
              isEditTarget={editingCatIndex === index}
              cat={editingCatIndex === index ? catArray[index] : cat}
              onCatChipClick={(e) => {
                //find and set picker position
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

              //create a copy
              const tmpCatArray: CatClientSide[] = structuredClone(catArray);

              //add a new cat
              tmpCatArray.push(
                createNewCat({ amount: 0, txId: tx?.id, nameArray: [] }),
              );

              setCatArray(tmpCatArray);

              //The index is referenced from the clone instead of the react state as they are identical and the react state wouldn't have updated yet (See: batch state update)
              setEditingMergedCatIndex(tmpCatArray.length - 1);

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
              aria-label="Confirm adding category"
              //disabled={isWrongTotal}
              onClickAsync={async () => {
                if (!tx || tx.id === undefined) {
                  console.error("Can't upsert catArray. tx is undefined");
                  return;
                }

                await upsertManyCat.mutateAsync({
                  catArray: catArray,
                  txId: tx.id,
                });

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
                setCatArray(tx.catArray);
              }}
            >
              <span className="icon-[iconamoon--close-fill]" />
            </ActionBtn>
          </div>
        )}

        {tx && (
          <CatPicker
            ref={catPickerRef}
            appUserCatArray={catArray || []}
            //Fallback to 0 for initial boundingClient size.
            editingCatIndex={editingCatIndex || 0}
            position={pickerPosition}
            closePicker={() => {
              setEditingMergedCatIndex(undefined);
              setIsManaging(false);
              setPickerPosition(offScreen);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Cat;
