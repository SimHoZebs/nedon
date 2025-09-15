import type { GroupClientSide } from "@/types/group";
import type { Tx } from "@/types/tx";
import type { UnAuthUserClientSide, UserClientSide } from "@/types/user";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Store {
  linkToken: string | null;
  setLinkToken: (linkToken: string | null) => void;

  appUser: UnAuthUserClientSide | UserClientSide | null;
  setAppUser: (user: UnAuthUserClientSide | UserClientSide | null) => void;

  appGroup?: GroupClientSide;
  setAppGroup: (group: GroupClientSide | undefined) => void;

  screenType: "mobile" | "tablet" | "desktop";
  setScreenType: (screenType: "mobile" | "tablet" | "desktop") => void;

  appInitDatetime: Date;
  setAppInitDatetime: (datetime: Date) => void;

  verticalCatPicker: boolean;
  setVerticalCatPicker: (verticalCatPicker: boolean) => void;

  txOrganizedByTimeArray: Tx[][][][];
  setTxOrganizedByTimeArray: (txOrganizedByTimeArray: Tx[][][][]) => void;
}

export const useStore = create<Store>()(
  devtools<Store>(
    (set) => ({
      linkToken: "", // Don't set to null or error message will show up briefly when site loads
      setLinkToken: (linkToken: string | null) => set({ linkToken }),

      appUser: null,
      setAppUser: (appUser: UnAuthUserClientSide | null) => set({ appUser }),

      appGroup: undefined,
      setAppGroup: (appGroup: GroupClientSide | undefined) => set({ appGroup }),

      appInitDatetime: new Date(Date.now()),
      setAppInitDatetime: (datetime) => set({ appInitDatetime: datetime }),

      screenType: "desktop",
      setScreenType: (screenType: "mobile" | "tablet" | "desktop") =>
        set({ screenType }),

      verticalCatPicker: false,
      setVerticalCatPicker: (verticalCatPicker: boolean) =>
        set({ verticalCatPicker }),

      txOrganizedByTimeArray: [],
      setTxOrganizedByTimeArray: (txOragnizedByTimeArray: Tx[][][][]) =>
        set({ txOrganizedByTimeArray: txOragnizedByTimeArray }),
    }),

    { name: "global-store" },
  ),
);
