import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import { GroupClientSide, UserClientSide } from "./types";

export const useLocalStoreDelay = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
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

      { name: "local-storage" },
    ),
  ),
);

interface Store {
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  appUser?: UserClientSide;
  setAppUser: (user: UserClientSide | undefined) => void;

  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

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

    verticalCategoryPicker: false,
    setVerticalCategoryPicker: (verticalCategoryPicker: boolean) =>
      set({ verticalCategoryPicker }),
  })),
);
