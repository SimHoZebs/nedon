import type { UserClientSide } from "@/types/user";

export const emptyUser: UserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  PUBLIC_TOKEN: null,
  ITEM_ID: null,
  cursor: null,
  // The transfer_id is only relevant for Transfer ACH product.
  TRANSFER_ID: null,
  // The payment_id is only relevant for the UK/EU Payment Initiation product.
  PAYMENT_ID: null,
  ownedTxArray: [],
  connectedWithArray: [],
};
