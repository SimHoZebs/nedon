import type { UserClientSide } from "@/types/user";

export const emptyUser: UserClientSide = {
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
