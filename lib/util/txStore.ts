import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { resetFullTx } from "./tx";
import { FullTx, SplitClientSide, TxInDB } from "./types";

interface Store {
  txOnModal: FullTx | undefined;
  setTxOnModal: (tx: FullTx | undefined) => void;

  //Function to refresh client data with database data after it processed client's update.
  //This is only for data that has been SAVED.
  refreshDBData: (tx: TxInDB | SplitClientSide[]) => void;
  resetTx: () => void;

  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;

  editingSplitUserIndex: number | undefined;
  setEditingSplitUserIndex: (index: number | undefined) => void;

  isEditingSplit: boolean;
  setIsEditingSplit: (isManaging: boolean) => void;

  unCalcSplitAmountArray: string[];
  setUnCalcSplitAmountArray: (splitArray: string[]) => void;
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
        } else {
          return {
            txOnModal: {
              ...clone,
              ...dbData,
            },
          };
        }
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

    editingSplitUserIndex: undefined,
    setEditingSplitUserIndex: (index: number | undefined) =>
      set({ editingSplitUserIndex: index }),

    isEditingSplit: false,
    setIsEditingSplit: (isEditing: boolean) =>
      set({ isEditingSplit: isEditing }),

    unCalcSplitAmountArray: [],
    setUnCalcSplitAmountArray: (splitArray: string[]) =>
      set({ unCalcSplitAmountArray: splitArray }),
  })),
);
