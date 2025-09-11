import type { Cat, UnsavedCat } from "@/types/cat";
import type {
  SplitTx,
  Tx,
  TxWithUnsavedContent,
  UnsavedSplitTx,
  UnsavedTx,
} from "@/types/tx";

import { useStore } from "./store";

// Type guard to check if a transaction can accept unsaved content updates
function canUpdateWithUnsavedContent(
  tx: UnsavedTx | TxWithUnsavedContent | Tx | null,
): tx is TxWithUnsavedContent {
  if (!tx) return false;
  // Check if transaction already has unsaved content or if we're adding unsaved content
  return "catArray" in tx && Array.isArray(tx.catArray);
}

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

  txOnModal: UnsavedTx | TxWithUnsavedContent | Tx | null;
  setTxOnModal: (tx: Tx) => void;
  setCatArray: (catArray: (UnsavedCat | Cat)[]) => void;
  setSplitTxArray: (splitTxArray: (UnsavedSplitTx | SplitTx)[]) => void;

  /**
   * Only use this function when new data is expected from the database.
   * Refreshes client data with database data after it processed client's update.
   */
  revertToTxInDB: () => void;

  //catArray
  hasEditedCatArray: boolean;
  setHasEditedCatArray: (hasEditedCatArray: boolean) => void;

  isEditingSplitTx: boolean;
  setIsEditingSplitTx: (isEditingSplitTx: boolean) => void;

  focusedSplitTxIndex: number | undefined;
  setFocusedSplitTxIndex: (index: number | undefined) => void;

  editedSplitTxIndexArray: number[];
  setEditedSplitTxIndexArray: (
    input: number[] | ((prev: number[]) => number[]),
  ) => void;

  splitTxAmountDisplayArray: string[];
  setSplitTxAmountDisplayArray: (splitTxAmountDisplayArray: string[]) => void;
}

export const useTxStore = create<Store>()(
  devtools(
    (set) => ({
      txOnModalIndex: null,
      setTxOnModalIndex: (index) => set({ txOnModalIndex: index }),

      txOnModal: null,
      setTxOnModal: (tx) => set({ txOnModal: tx }),

      setCatArray: (catArray: (UnsavedCat | Cat)[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          // Only allow updates if tx supports unsaved content
          if (!canUpdateWithUnsavedContent(store.txOnModal)) {
            console.warn("Cannot update catArray on fully saved transaction");
            return store;
          }

          return {
            txOnModal: {
              ...store.txOnModal,
              catArray,
            } as TxWithUnsavedContent,
          };
        });
      },

      setSplitTxArray: (splitTxArray: (UnsavedSplitTx | SplitTx)[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          // Only allow updates if tx supports unsaved content
          if (!canUpdateWithUnsavedContent(store.txOnModal)) {
            console.warn(
              "Cannot update splitTxArray on fully saved transaction",
            );
            return store;
          }

          return {
            txOnModal: {
              ...store.txOnModal,
              splitTxArray,
            } as TxWithUnsavedContent,
          };
        });
      },

      revertToTxInDB: () =>
        set((store) => {
          if (!store.txOnModalIndex) return store;
          const [y, m, d, i] = store.txOnModalIndex;

          const txOrganizedByTimeArray =
            useStore.getState().txOrganizedByTimeArray;
          return {
            txOnModal: store.txOnModal
              ? txOrganizedByTimeArray[y][m][d][i]
              : null,
          };
        }),

      hasEditedCatArray: false,
      setHasEditedCatArray: (hasEditedCatArray: boolean) =>
        set({ hasEditedCatArray: hasEditedCatArray }),

      editedSplitTxIndexArray: [],
      setEditedSplitTxIndexArray: (
        input: number[] | ((prev: number[]) => number[]),
      ) => {
        set((store) => {
          if (typeof input === "function") {
            return {
              editedSplitTxIndexArray: input(store.editedSplitTxIndexArray),
            };
          }
          return { editedSplitTxIndexArray: input };
        });
      },

      isEditingSplitTx: false,
      setIsEditingSplitTx: (isEditingSplitTx: boolean) =>
        set({ isEditingSplitTx: isEditingSplitTx }),

      focusedSplitTxIndex: undefined,
      setFocusedSplitTxIndex: (index: number | undefined) =>
        set({ focusedSplitTxIndex: index }),

      //sum of category amount
      //string instead of number to temporarily store arithmetic
      splitTxAmountDisplayArray: [],
      setSplitTxAmountDisplayArray: (splitTxAmountDisplayArray: string[]) =>
        set({ splitTxAmountDisplayArray: splitTxAmountDisplayArray }),
    }),
    { name: "txStore" },
  ),
);
