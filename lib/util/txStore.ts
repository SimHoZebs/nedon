import type { UnsavedCat } from "@/types/cat";
import type { BaseTx, TxInDB, UnsavedTxInDB } from "@/types/tx";

import { useStore } from "./store";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * Tx depends on three forms of data:
 * 1. Data in the database
 * 2. Data on the client side synced with the database
 * 3. Data on the client side that isn't synced with the database due to
 * temporary modifications
 *
 * */
interface Store {
  txOnModalIndex: number[] | null;
  setTxOnModalIndex: (index: number[] | null) => void;

  txOnModal: BaseTx | UnsavedTxInDB | TxInDB | null;
  setTxOnModal: (tx: BaseTx | TxInDB) => void;

  setSplitArray: (splitArray: SplitClientSide[]) => void;
  setCatArray: (catArray: UnsavedCat[]) => void;

  /**
   * Only use this function when new data is expected from the database.
   * Refreshes client data with database data after it processed client's update.
   */
  revertToTxInDB: () => void;

  //catArray
  hasEditedCatArray: boolean;
  setHasEditedCatArray: (hasEditedCatArray: boolean) => void;

  isEditingSplit: boolean;
  setIsEditingSplit: (isEditingSplit: boolean) => void;

  focusedSplitIndex: number | undefined;
  setFocusedSplitIndex: (index: number | undefined) => void;

  editedSplitIndexArray: number[];
  setEditedSplitIndexArray: (
    input: number[] | ((prev: number[]) => number[]),
  ) => void;

  splitAmountDisplayArray: string[];
  setSplitAmountDisplayArray: (splitAmountDisplayArray: string[]) => void;
}

export const useTxStore = create<Store>()(
  devtools(
    (set) => ({
      txOnModalIndex: null,
      setTxOnModalIndex: (index) => set({ txOnModalIndex: index }),

      txOnModal: null,
      setTxOnModal: (tx) => set({ txOnModal: tx }),

      setSplitArray: (splitArray) => {
        set((store) => {
          if (!store.txOnModal) return store;

          const clone = structuredClone(store.txOnModal);

          return {
            txOnModal: {
              ...clone,
              splitArray: splitArray,
            },
          };
        });
      },

      setCatArray: (catArray) => {
        set((store) => {
          if (!store.txOnModal) return store;

          const clone = structuredClone(store.txOnModal);

          return {
            txOnModal: {
              ...clone,
              catArray: catArray,
            },
          };
        });
      },

      revertToTxInDB: () =>
        set((store) => {
          if (!store.txOnModalIndex) return store;
          const [y, m, d, i] = store.txOnModalIndex;

          const txOrganizedByTimeArray =
            useStore.getState().txOragnizedByTimeArray;
          return {
            txOnModal: store.txOnModal
              ? txOrganizedByTimeArray[y][m][d][i]
              : null,
          };
        }),

      hasEditedCatArray: false,
      setHasEditedCatArray: (hasEditedCatArray: boolean) =>
        set({ hasEditedCatArray: hasEditedCatArray }),

      editedSplitIndexArray: [],
      setEditedSplitIndexArray: (
        input: number[] | ((prev: number[]) => number[]),
      ) => {
        set((store) => {
          if (typeof input === "function") {
            return {
              editedSplitIndexArray: input(store.editedSplitIndexArray),
            };
          }
          return { editedSplitIndexArray: input };
        });
      },

      isEditingSplit: false,
      setIsEditingSplit: (isEditingSplit: boolean) =>
        set({ isEditingSplit: isEditingSplit }),

      focusedSplitIndex: undefined,
      setFocusedSplitIndex: (index: number | undefined) =>
        set({ focusedSplitIndex: index }),

      //sum of category amount
      //string instead of number to temporarily store arithmetic
      splitAmountDisplayArray: [],
      setSplitAmountDisplayArray: (splitAmountDisplayArray: string[]) =>
        set({ splitAmountDisplayArray: splitAmountDisplayArray }),
    }),
    { name: "txStore" },
  ),
);
