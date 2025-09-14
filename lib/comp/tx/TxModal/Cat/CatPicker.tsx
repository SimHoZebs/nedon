import catStyleArray from "@/util/catStyle";
import { trpc } from "@/util/trpc";

import type { UnsavedCat } from "@/types/cat";
import { isUnsavedTx } from "@/types/tx";

import { createNewCat } from "lib/domain/cat";
import { useStore } from "lib/store/store";
import { useTxStore } from "lib/store/txStore";
import { type ForwardedRef, forwardRef, useState } from "react";
import type { PlaidCategory } from "server/util/plaidCategories";

interface Props {
  appUserCatArray: UnsavedCat[];
  editingCatIndex: number;
  closePicker: () => void;
  position: { x: number; y: number };
}

const CatPicker = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const createTx = trpc.tx.create.useMutation();
    const upsertCatArray = trpc.cat.upsertMany.useMutation();
    const catOptionArray = trpc.cat.getPlaidCats.useQuery(undefined, {
      staleTime: Number.POSITIVE_INFINITY,
    });
    const queryClient = trpc.useUtils();
    const revertToTxInDB = useTxStore((state) => state.revertToTxInDB);

    const tx = useTxStore((state) => state.txOnModal);
    const catArray = tx?.catArray || [];
    const screenType = useStore((state) => state.screenType);

    const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null);

    const editingCat = props.appUserCatArray[props.editingCatIndex];

    const resetPicker = () => {
      setSelectedPrimary(null);
      revertToTxInDB();
    };

    const applyChangesToCat = async (cat: UnsavedCat) => {
      if (!tx) {
        console.error("Can't apply changes to cat. tx is undefined.");
        return;
      }

      const tmpCatArray = structuredClone(catArray);
      const tmpTx = structuredClone(tx);

      if (isUnsavedTx(tmpTx)) {
        tmpCatArray[tmpCatArray.length - 1] = createNewCat(cat);

        tmpTx.catArray = tmpCatArray;

        console.log("tx.id is undefined. Creating a new tx.", tmpTx);
        await createTx.mutateAsync(tmpTx);
      } else {
        // Update the existing category or create a new one
        if (editingCat.id) {
          // Update existing
          tmpCatArray[props.editingCatIndex] = {
            ...editingCat,
          };
        } else {
          // Create new
          tmpCatArray[tmpCatArray.length - 1] = createNewCat(cat);
        }

        await upsertCatArray.mutateAsync({
          txId: tmpTx.id,
          catArray: tmpCatArray,
        });
      }

      queryClient.tx.invalidate();
    };

    const plaidCatsToCatArray = (plaidCats: PlaidCategory) => {
      return Object.entries(plaidCats).flatMap(([primaryName, detailedObj]) => {
        return {
          name: primaryName,
          detailed: Object.keys(detailedObj).map((name) => ({
            name: name,
          })),
        };
      });
    };

    const primaryCategories = plaidCatsToCatArray(catOptionArray.data || {});

    const detailedCategories = selectedPrimary
      ? catOptionArray.data
        ? Object.entries(catOptionArray.data[selectedPrimary] || {}).map(
            ([detailedName]) => ({
              primary: selectedPrimary,
              detailed: detailedName,
            }),
          )
        : []
      : [];

    return catOptionArray.data ? (
      <div
        ref={ref}
        className={
          "absolute left-0 flex max-h-[50vh] w-full flex-col items-start gap-y-1 rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 shadow-md shadow-zinc-900 sm:w-96"
        }
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={
          screenType === "desktop"
            ? { top: props.position.y, left: props.position.x }
            : { top: props.position.y, left: 0 }
        }
      >
        <div className="flex w-full justify-between px-2 py-1">
          <div className="flex w-fit items-center">
            {selectedPrimary && (
              <button
                type="button"
                aria-label="back"
                className="flex"
                onClick={() => setSelectedPrimary(null)}
              >
                <span className="icon-[mdi--chevron-left] h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex gap-x-2">
            <button
              type="button"
              className="text-pink-400 hover:text-pink-500"
              onClick={(e) => {
                e.stopPropagation();
                resetPicker();
                props.closePicker();
              }}
            >
              cancel
            </button>
          </div>
        </div>

        <hr className="w-full border-zinc-700" />

        <div className="grid w-full auto-cols-fr grid-cols-3 overflow-x-hidden overflow-y-scroll bg-zinc-800 pb-1 pl-2 text-xs">
          {!selectedPrimary
            ? primaryCategories.map((primaryCat) => (
                <button
                  className="group my-1 mr-2 flex aspect-square flex-col items-center justify-center gap-y-1 hyphens-auto rounded-lg border border-zinc-400 text-center hover:bg-zinc-700 hover:text-zinc-200"
                  type="button"
                  onClick={() => setSelectedPrimary(primaryCat.name)}
                  key={primaryCat.name}
                >
                  <span
                    className={`h-6 w-6 ${
                      catStyleArray[primaryCat.name]?.textColor ||
                      "text-zinc-500 group-hover:text-zinc-400"
                    } ${
                      catStyleArray[primaryCat.name]?.icon ||
                      "icon-[material-symbols--category-outline]"
                    }`}
                  />
                  <p>{primaryCat.name}</p>
                </button>
              ))
            : detailedCategories.map((detailedCat) => (
                <button
                  className="group my-1 mr-2 flex aspect-square flex-col items-center justify-center gap-y-1 hyphens-auto rounded-lg border border-zinc-400 text-center hover:bg-zinc-700 hover:text-zinc-200"
                  type="button"
                  onClick={async () => {
                    await applyChangesToCat({
                      txId: editingCat.txId,
                      primary: detailedCat.primary,
                      detailed: detailedCat.detailed,
                      description: editingCat.description,
                      amount: editingCat.amount,
                    });
                    resetPicker();
                    props.closePicker();
                  }}
                  key={detailedCat.detailed}
                >
                  <span
                    className={`h-6 w-6 ${
                      catStyleArray[detailedCat.detailed]?.textColor ||
                      "text-zinc-500 group-hover:text-zinc-400"
                    } ${
                      catStyleArray[detailedCat.detailed]?.icon ||
                      "icon-[material-symbols--category-outline]"
                    }`}
                  />
                  <p>{detailedCat.detailed}</p>
                </button>
              ))}
        </div>
      </div>
    ) : null;
  },
);

export default CatPicker;
