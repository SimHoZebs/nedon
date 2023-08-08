import { FullTransaction, GroupClientSide, UserClientSide } from "./types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface Store {
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  appUser?: UserClientSide;
  setAppUser: (user: UserClientSide | undefined) => void;

  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

  currentTransaction: FullTransaction | undefined;
  setCurrentTransaction: (transaction: FullTransaction | undefined) => void;

  verticalCategoryPicker: boolean;
  setVerticalCategoryPicker: (verticalCategoryPicker: boolean) => void;

  test: string;
  setTest: (test: string) => void;
}

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

import { useState, useEffect } from "react";

const useLocalStoreDelay = <T, F>(
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

export default useLocalStoreDelay;

export const useStore = create<Store>()((set) => ({
  linkToken: "", // Don't set to null or error message will show up briefly when site loads
  setLinkToken: (linkToken: string | null) => set({ linkToken }),

  appUser: undefined,
  setAppUser: (appUser: UserClientSide | undefined) => set({ appUser }),

  appGroup: undefined,
  setAppGroup: (appGroup: GroupClientSide | undefined) => set({ appGroup }),

  currentTransaction: undefined,
  setCurrentTransaction: (currentTransaction: FullTransaction | undefined) =>
    set({ currentTransaction }),

  verticalCategoryPicker: false,
  setVerticalCategoryPicker: (verticalCategoryPicker: boolean) =>
    set({ verticalCategoryPicker }),

  test: "",
  setTest: (test: string) => set({ test }),
}));

interface TransactionStore {}

export const useTransactionStore = create<TransactionStore>()((set) => ({
  currentTransaction: undefined,
  setCurrentTransaction: (currentTransaction: FullTransaction | undefined) =>
    set({ currentTransaction }),
}));
