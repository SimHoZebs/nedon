import { Transaction } from "plaid";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { resetFullTransaction } from "./transaction";
import { FullTransaction, SplitInDB, SplitClientSide } from "./types";

interface Store {
  transactionOnModal: FullTransaction | undefined;
  setTransactionOnModal: (transaction: FullTransaction | undefined) => void;
  refreshDBData: (
    transaction: (Transaction & { splitArray: SplitInDB[] }) | null
  ) => void;
  resetTransactionOnModal: () => void;

  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;
}

export const useTransactionStore = create<Store>()(
  devtools((set) => ({
    transactionOnModal: undefined,
    setTransactionOnModal: (transasction: FullTransaction | undefined) =>
      set({ transactionOnModal: transasction }),

    refreshDBData: (
      transaction: (Transaction & { splitArray: SplitInDB[] }) | null
    ) => {
      set((store) => {
        if (!store.transactionOnModal) return store;

        const clone = structuredClone(store.transactionOnModal);
        const test = {
          transactionOnModal: {
            ...clone,
            ...transaction,
          },
        };
        console.log("test", test);

        return {
          transactionOnModal: {
            ...clone,
            ...transaction,
          },
        };
      });
    },

    resetTransactionOnModal: () =>
      set((store) => {
        if (!store.transactionOnModal) return store;

        const transaction = resetFullTransaction(store.transactionOnModal);

        return {
          transactionOnModal: transaction,
          unsavedSplitArray: transaction.splitArray,
        };
      }),

    unsavedSplitArray: [],
    setUnsavedSplitArray: (splitArray: SplitClientSide[]) =>
      set({ unsavedSplitArray: splitArray }),
  }))
);
