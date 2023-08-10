import {
  FullTransaction,
  GroupClientSide,
  SplitClientSide,
  SplitInDB,
  UserClientSide,
  isFullTransactionInDB,
} from "./types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useState, useEffect } from "react";
import { Transaction } from "@prisma/client";
import { resetFullTransaction } from "./transaction";

export const useLocalStoreDelay = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

interface LocalStore {
  userIdArray: string[];
  setUserIdArray: (userIdArray: string[]) => void;
  addUserId: (userId: string) => void;
  deleteUserId: (userId: string) => void;
}

export const useLocalStore = create<LocalStore>()(
  devtools(
    persist(
      (set, get) => ({
        userIdArray: [],

        setUserIdArray: (userIdArray: string[]) => set({ userIdArray }),

        addUserId: (userId: string) =>
          set((prev) => {
            if (!prev.userIdArray) return { userIdArray: [userId] };
            return { userIdArray: [...get().userIdArray, userId] };
          }),

        deleteUserId: (userId: string) =>
          set((prev) => ({
            userIdArray: prev.userIdArray.filter((id) => id !== userId),
          })),
      }),

      { name: "local-storage" }
    )
  )
);

interface Store {
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  appUser?: UserClientSide;
  setAppUser: (user: UserClientSide | undefined) => void;

  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

  transactionOnModal: FullTransaction | undefined;
  setTransactionOnModal: (transaction: FullTransaction | undefined) => void;
  refreshDBData: (
    transaction: (Transaction & { splitArray: SplitInDB[] }) | null
  ) => void;
  resetTransactionOnModal: () => void;

  unsavedSplitArray: SplitClientSide[];
  setUnsavedSplitArray: (splitArray: SplitClientSide[]) => void;

  verticalCategoryPicker: boolean;
  setVerticalCategoryPicker: (verticalCategoryPicker: boolean) => void;
}

export const useStore = create<Store>()(
  devtools((set) => ({
    linkToken: "", // Don't set to null or error message will show up briefly when site loads
    setLinkToken: (linkToken: string | null) => set({ linkToken }),

    appUser: undefined,
    setAppUser: (appUser: UserClientSide | undefined) => set({ appUser }),

    appGroup: undefined,
    setAppGroup: (appGroup: GroupClientSide | undefined) => set({ appGroup }),

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

    verticalCategoryPicker: false,
    setVerticalCategoryPicker: (verticalCategoryPicker: boolean) =>
      set({ verticalCategoryPicker }),
  }))
);
