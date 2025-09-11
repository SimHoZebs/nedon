import type { UnAuthUserClientSide } from "@/types/user";

export const emptyUser: UnAuthUserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  publicToken: null,
  itemId: null,
  cursor: null,
  // The transfer_id is only relevant for Transfer ACH product.
  transferId: null,
  myConnectionArray: [],
};
