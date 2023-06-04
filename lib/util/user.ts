import { UserClientSide } from "./types";

export const emptyUser: UserClientSide = {
  id: "",
  name: "",
  hasAccessToken: false,
  PUBLIC_TOKEN: null,
  ITEM_ID: null,
  // The transfer_id is only relevant for Transfer ACH product.
  TRANSFER_ID: null,
  // The payment_id is only relevant for the UK/EU Payment Initiation product.
  PAYMENT_ID: null,
  groupArray: [{ id: "", ownerId: "" }],
};
