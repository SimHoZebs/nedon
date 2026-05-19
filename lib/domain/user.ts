import type { UnAuthUserClientSide } from "@/types/user";

export const emptyUser: UnAuthUserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  myConnectionArray: [],
  bankSyncToken: null,
};
