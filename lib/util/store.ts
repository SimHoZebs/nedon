import { FullTransaction, GroupClientSide, UserClientSide } from "./types";
import { create } from "zustand";

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
