import type { GroupClientSide } from "@/types/group";
import type { TxInDB } from "@/types/tx";
import type { UserClientSide } from "@/types/user";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Store {
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  appUser?: UserClientSide;
  setAppUser: (user: UserClientSide | undefined) => void;

  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

  screenType: "mobile" | "tablet" | "desktop";
  setScreenType: (screenType: "mobile" | "tablet" | "desktop") => void;

  datetime: string;
  setDatetime: (datetime: string) => void;

  verticalCatPicker: boolean;
  setVerticalCatPicker: (verticalCatPicker: boolean) => void;

  txOragnizedByTimeArray: TxInDB[][][][];
  setTxOragnizedByTimeArray: (txOragnizedByTimeArray: TxInDB[][][][]) => void;
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

      datetime: new Date(Date.now()).toString(),
      setDatetime: (datetime: string) => set({ datetime }),

      screenType: "desktop",
      setScreenType: (screenType: "mobile" | "tablet" | "desktop") =>
        set({ screenType }),

      verticalCatPicker: false,
      setVerticalCatPicker: (verticalCatPicker: boolean) =>
        set({ verticalCatPicker }),

      txOragnizedByTimeArray: [],
      setTxOragnizedByTimeArray: (txOragnizedByTimeArray) =>
        set({ txOragnizedByTimeArray }),
    }),

    { name: "global-store" },
  ),
);
