import type { CatFormState } from "@/types/cat";
import type { SplitTxFormState, Tx, TxFormState } from "@/types/tx";

import { useStore } from "./store";

import { mapTxToFormState } from "lib/domain/tx";
import { toMoney } from "lib/util/money";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

/**
 * TxOnModal depends on:
 * 1. this global store, a read-only reference to react query cache
 * 2. local useState in TxModal for temporary edits
 * */
interface Store {
  txOnModalIndex: number[] | null;
  setTxOnModalIndex: (index: number[] | null) => void;

  txOnModal: TxFormState | null;
  setTxOnModal: (tx: Tx) => void;
  setCatArray: (catArray: CatFormState[]) => void;
  setSplitTxArray: (splitTxArray: SplitTxFormState[]) => void;

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
      setTxOnModal: (tx) => set({ txOnModal: mapTxToFormState(tx) }),

      setCatArray: (catArray: CatFormState[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          return {
            txOnModal: {
              ...store.txOnModal,
              catArray: catArray.map((cat) => ({
                ...cat,
                amount: toMoney(cat.amount),
              })),
            },
          };
        });
      },

      setSplitTxArray: (splitTxArray: SplitTxFormState[]) => {
        set((store) => {
          if (!store.txOnModal) return store;

          return {
            txOnModal: {
              ...store.txOnModal,
              splitTxArray: splitTxArray.map((split) => ({
                ...split,
                amount: toMoney(split.amount),
                userTotal: toMoney(split.userTotal),
              })),
            },
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
              ? mapTxToFormState(txOrganizedByTimeArray[y][m][d][i])
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
