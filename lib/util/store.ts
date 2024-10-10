import { useEffect, useState } from "react";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type { GroupClientSide, UserClientSide } from "@/types/types";

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
  userId: string | null;
  setUserId: (userId: string) => void;
}

export const useLocalStore = create<LocalStore>()(
  devtools(
    persist(
      (set) => ({
        userId: null,
        setUserId: (userId: string) => set({ userId }),
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

  screenType: "mobile" | "tablet" | "desktop";
  setScreenType: (screenType: "mobile" | "tablet" | "desktop") => void;

  verticalCatPicker: boolean;
  setVerticalCatPicker: (verticalCatPicker: boolean) => void;
}

export const useStore = create<Store>()(
  devtools(
    (set) => ({
      linkToken: "", // Don't set to null or error message will show up briefly when site loads
      setLinkToken: (linkToken: string | null) => set({ linkToken }),

      appUser: undefined,
      setAppUser: (appUser: UserClientSide | undefined) => set({ appUser }),

      appGroup: undefined,
      setAppGroup: (appGroup: GroupClientSide | undefined) => set({ appGroup }),

      screenType: "desktop",
      setScreenType: (screenType: "mobile" | "tablet" | "desktop") =>
        set({ screenType }),

      verticalCatPicker: false,
      setVerticalCatPicker: (verticalCatPicker: boolean) =>
        set({ verticalCatPicker }),
    }),

    { name: "global-store" },
  ),
);
