import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { resetFullTransaction } from "./transaction";
import {
  FullTransaction,
  SplitInDB,
  SplitClientSide,
  TransactionInDB,
} from "./types";
import { Transaction } from "@prisma/client";

interface Store {
  transactionOnModal: FullTransaction | undefined;
  setTransactionOnModal: (transaction: FullTransaction | undefined) => void;

  refreshDBData: (
    transaction: Transaction & { splitArray: SplitInDB[] }
  ) => void;
  resetTransaction: () => void;

  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;
}

export const useTransactionStore = create<Store>()(
  devtools((set) => ({
    transactionOnModal: undefined,
    setTransactionOnModal: (transasction: FullTransaction | undefined) =>
      set({ transactionOnModal: transasction }),

    refreshDBData: (dbData: TransactionInDB) => {
      set((store) => {
        if (!store.transactionOnModal) return store;

        const clone = structuredClone(store.transactionOnModal);

        return {
          transactionOnModal: {
            ...clone,
            ...dbData,
          },
        };
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
