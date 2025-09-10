import type { unAuthUserClientSide } from "@/types/user";

export const emptyUser: unAuthUserClientSide = {
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
