import type { CatClientSide, TreedCat } from "@/types/cat";
import { createNewCat } from "@/util/cat";
import catStyleArray from "@/util/catStyle";
import { useStore } from "@/util/store";
import { trpc } from "@/util/trpc";
import { useTxStore } from "@/util/txStore";
import { type ForwardedRef, forwardRef, useEffect, useState } from "react";

interface Props {
  appUserCatArray: CatClientSide[];
  editingCatIndex: number;
  closePicker: () => void;
  position: { x: number; y: number };
}

const CatPicker = forwardRef(
  (props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const createTx = trpc.tx.create.useMutation();
    const upsertCatArray = trpc.cat.upsertMany.useMutation();
    const catOptionArray = trpc.getCatOptionArray.useQuery(undefined, {
      staleTime: Number.POSITIVE_INFINITY,
    });
    const queryClient = trpc.useUtils();
    const revertToTxInDB = useTxStore((state) => state.revertToTxInDB);

    const tx = useTxStore((state) => state.txOnModal);
    const catArray = tx?.catArray || [];
    const screenType = useStore((state) => state.screenType);
    const [unsavedNameArray, setCurrentNameArray] = useState<string[]>([]);
    const [currentOptionArray, setCurrentOptionArray] = useState<TreedCat[]>(
      [],
    );

    const editingCat = props.appUserCatArray[props.editingCatIndex];

    const resetPicker = () => {
      setCurrentNameArray([]);
      revertToTxInDB();

      if (!catOptionArray.data) {
        console.error(
          "Can't reset picker. catOptionArray is undefined. How did you get here?",
        );
        return;
      }
      setCurrentOptionArray(catOptionArray.data);
    };

    /**
     * @param clickedTreedCat  if the cat is assigned by click instead of the "save" button.
     */
    const applyChangesToCat = async (clickedTreedCat?: TreedCat) => {
      if (!tx) {
        console.error("Can't apply changes to cat. tx is undefined.");
        return;
      }

      const tmpCatArray = structuredClone(catArray);
      const tmpNameArray = structuredClone(unsavedNameArray);
      const tmpTx = structuredClone(tx);
      if (clickedTreedCat) {
        tmpNameArray.push(clickedTreedCat.name);
      }

      //The last element is the temporary category this update is for.
      tmpCatArray[tmpCatArray.length - 1] = createNewCat({
        txId: tmpTx.id || "",
        nameArray: tmpNameArray,
        amount: 0,
      });

      tmpTx.catArray = tmpCatArray;

      if (!tmpTx.id) {
        console.log("tx.id is undefined. Creating a new tx.", tmpTx);
        await createTx.mutateAsync(tmpTx);
      } else {
        await upsertCatArray.mutateAsync({
          txId: tmpTx.id,
          catArray: tmpCatArray,
        });
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
          !props.appUserCatArray.find(
            (unsavedCat) => unsavedCat.nameArray.at(-1) === option.name,
          ),
      );

      setCurrentOptionArray(filteredOptionArray);
    }, [catOptionArray.data, catOptionArray.status, props.appUserCatArray]);

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
            {unsavedNameArray.length > 0 && (
              <button
                type="button"
                aria-label="back"
                className="flex"
                onClick={() => {
                  if (!tx)
                    return console.error(
                      "Can't reset splitArray. tx is undefined.",
                    );
                  resetPicker();
                }}
              >
                <span className="icon-[mdi--chevron-left] h-6 w-6" />
              </button>
            )}
          </div>

          <div className="flex gap-x-2">
            <button
              type="button"
              className="text-indigo-300 hover:text-indigo-400"
              onClick={async () => {
                if (editingCat.id === null) {
                  await applyChangesToCat();
                  resetPicker();
                  props.closePicker();
                }
              }}
            >
              save
            </button>
            <button
              type="button"
              className="text-pink-400 hover:text-pink-500"
              onClick={(e) => {
                e.stopPropagation();
                if (!tx)
                  return console.error(
                    "Can't reset splitArray. tx is undefined.",
                  );
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
          {currentOptionArray.map((cat) => (
            <button
              className="group my-1 mr-2 flex aspect-square flex-col items-center justify-center gap-y-1 rounded-lg border border-zinc-400 text-center hyphens-auto hover:bg-zinc-700 hover:text-zinc-200"
              type="button"
              onClick={async () => {
                if (cat.subCatArray.length === 0) {
                  await applyChangesToCat(cat);
                  resetPicker();
                  props.closePicker();
                } else {
                  const updatedOptionArray = cat.subCatArray;

                  const filteredOptionArray = updatedOptionArray.filter(
                    (option) =>
                      !props.appUserCatArray.find(
                        (unsavedCat) =>
                          unsavedCat.nameArray.at(-1) === option.name,
                      ),
                  );

                  setCurrentOptionArray(filteredOptionArray);
                  setCurrentNameArray((prev) => [...prev, cat.name]);
                }
              }}
              key={cat.name}
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
                  `${cat.subCatArray.length} subcategories`}
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
