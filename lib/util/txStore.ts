import type { Cat, Split } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { CatClientSide } from "@/types/cat";
import { type SplitClientSide, isSplitArrayInDB } from "@/types/split";
import {
  isTxInDB,
  type TxInDB,
  type UnsavedTx,
  type UnsavedTxInDB,
} from "@/types/tx";

/**
 * Tx depends on three forms of data:
 * 1. Data in the database
 * 2. Data on the client side synced with the database
 * 3. Data on the client side that isn't synced with the database due to
 * temporary modifications
 *
 * */
interface Store {
  txOnModal: UnsavedTx | UnsavedTxInDB | TxInDB | null;
  setTxOnModal: (tx: UnsavedTx | TxInDB) => void;

  setSplitOnModal: (splitArray: Split[]) => void;
  /**
   * Only use this function when new data is expected from the database.
   * Refreshes client data with database data after it processed client's update.
   */
  refreshTxModalData: (tx: TxInDB | Split[] | Cat[]) => void;

  //only to reset tx to a state without a txInDB
  //resetTx: () => void;

  //catArray
  hasEditedCatArray: boolean;
  setHasEditedCatArray: (hasEditedCatArray: boolean) => void;

  unsavedCatArray: CatClientSide[];
  setUnsavedCatArray: (catArray: CatClientSide[]) => void;

  //splitArray
  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;

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
      txOnModal: null,
      setTxOnModal: (transasction: UnsavedTx | TxInDB) =>
        set({ txOnModal: transasction }),

      setSplitOnModal: (splitArray: Split[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          const clone = structuredClone(store.txOnModal);
          if (!isTxInDB(clone)) return store;

          const tx = clone as TxInDB;

          return {
            txOnModal: {
              ...tx,
              splitArray: splitArray,
            },
          };
        });
      },

      refreshTxModalData: (dbData: TxInDB | Split[] | Cat[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          const clone = structuredClone(store.txOnModal);
          //is Split[]
          if (isSplitArrayInDB(dbData)) {
            return {
              txOnModal: {
                ...clone,
                splitArray: dbData,
              },
            };
          }
          //is Cat[]
          if (Array.isArray(dbData)) {
            return {
              txOnModal: {
                ...clone,
                catArray: dbData,
              },
            };
          }
          //is TxInDB
          return {
            txOnModal: {
              ...clone,
              ...dbData,
            },
          };
        });
      },
      //
      // resetTx: () =>
      //   set((store) => {
      //     if (!store.txOnModal) return store;
      //
      //     if (!isTxInDB(store.txOnModal)) return store;
      //
      //     const tx = resetTx(store.txOnModal);
      //
      //     return {
      //       txOnModal: tx,
      //       unsavedSplitArray: tx.splitArray,
      //     };
      //   }),

      hasEditedCatArray: false,
      setHasEditedCatArray: (hasEditedCatArray: boolean) =>
        set({ hasEditedCatArray: hasEditedCatArray }),

      unsavedCatArray: [],
      setUnsavedCatArray: (catArray: CatClientSide[]) =>
        set({ unsavedCatArray: catArray }),

      unsavedSplitArray: [],
      setUnsavedSplitArray: (splitArray: SplitClientSide[]) =>
        set({ unsavedSplitArray: splitArray }),

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
