import type { UnAuthUserClientSide } from "@/types/user";

export const emptyUser: UnAuthUserClientSide = {
  id: "",
  name: "",
  hasFinancialConnection: false,
  myConnectionArray: [],
  hasCompletedFinancialSync: false,
};
