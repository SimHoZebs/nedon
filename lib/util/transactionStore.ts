import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { resetFullTransaction } from "./transaction";
import { FullTransaction, SplitClientSide, TransactionInDB } from "./types";

interface Store {
  transactionOnModal: FullTransaction | undefined;
  setTransactionOnModal: (transaction: FullTransaction | undefined) => void;

  //This is only for data that has been SAVED.
  refreshDBData: (transaction: TransactionInDB | SplitClientSide[]) => void;
  resetTransaction: () => void;

  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;
}

export const useTransactionStore = create<Store>()(
  devtools((set) => ({
    transactionOnModal: undefined,
    setTransactionOnModal: (transasction: FullTransaction | undefined) =>
      set({ transactionOnModal: transasction }),

    refreshDBData: (dbData: TransactionInDB | SplitClientSide[]) => {
      set((store) => {
        if (!store.transactionOnModal) return store;

        const clone = structuredClone(store.transactionOnModal);
        if (Array.isArray(dbData)) {
          return {
            transactionOnModal: {
              ...clone,
              splitArray: dbData,
            },
          };
        } else {
          return {
            transactionOnModal: {
              ...clone,
              ...dbData,
            },
          };
        }
      });
    },

    resetTransaction: () =>
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
