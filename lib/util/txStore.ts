import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { resetFullTx } from "./tx";
import type { FullTx, SplitClientSide, TxInDB } from "./types";

interface Store {
  txOnModal: FullTx | undefined;
  setTxOnModal: (tx?: FullTx) => void;

  //Function to refresh client data with database data after it processed client's update.
  //This is only for data that has been SAVED.
  refreshDBData: (tx: TxInDB | SplitClientSide[]) => void;
  resetTx: () => void;

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
  devtools((set) => ({
    txOnModal: undefined,
    setTxOnModal: (transasction: FullTx | undefined) =>
      set({ txOnModal: transasction }),

    refreshDBData: (dbData: TxInDB | SplitClientSide[]) => {
      set((store) => {
        if (!store.txOnModal) return store;

        const clone = structuredClone(store.txOnModal);
        if (Array.isArray(dbData)) {
          return {
            txOnModal: {
              ...clone,
              splitArray: dbData,
            },
          };
        }
        return {
          txOnModal: {
            ...clone,
            ...dbData,
          },
        };
      });
    },

    resetTx: () =>
      set((store) => {
        if (!store.txOnModal) return store;

        const tx = resetFullTx(store.txOnModal);

        return {
          txOnModal: tx,
          unsavedSplitArray: tx.splitArray,
        };
      }),

    unsavedSplitArray: [],
    setUnsavedSplitArray: (splitArray: SplitClientSide[]) =>
      set({ unsavedSplitArray: splitArray }),

    editedSplitIndexArray: [],
    setEditedSplitIndexArray: (
      input: number[] | ((prev: number[]) => number[]),
    ) => {
      set((store) => {
        if (typeof input === "function") {
          return { editedSplitIndexArray: input(store.editedSplitIndexArray) };
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
  })),
);
