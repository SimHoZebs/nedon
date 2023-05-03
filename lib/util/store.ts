import { action, createStore, Action, createTypedHooks } from "easy-peasy";
import { User } from "@prisma/client";
import { UserClientSide } from "./types";

interface StoreModel {
  linkSuccess: boolean;
  setLinkSuccess: Action<StoreModel, boolean>;

  isItemAccess: boolean;
  setIsItemAccess: Action<StoreModel, boolean>;

  isPaymentInitiation: boolean;
  setIsPaymentInitiation: Action<StoreModel, boolean>;

  linkToken: string | null;
  setLinkToken: Action<StoreModel, string | null>;

  itemId: string | null;
  setItemId: Action<StoreModel, string | null>;

  products: string[];
  setProducts: Action<StoreModel, string[]>;

  linkTokenError: {
    error_message: string;
    error_code: string;
    error_type: string;
  };

  user: UserClientSide;
  setUser: Action<StoreModel, (user: UserClientSide) => UserClientSide>;
}

const store = createStore<StoreModel>({
  linkSuccess: false,
  setLinkSuccess: action((state, payload) => {
    state.linkSuccess = payload;
  }),

  isItemAccess: true,
  setIsItemAccess: action((state, payload) => {
    state.isItemAccess = payload;
  }),

  isPaymentInitiation: false,
  setIsPaymentInitiation: action((state, payload) => {
    state.isPaymentInitiation = payload;
  }),

  linkToken: "", // Don't set to null or error message will show up briefly when site loads
  setLinkToken: action((state, payload) => {
    state.linkToken = payload;
  }),

  itemId: null,
  setItemId: action((state, payload) => {
    state.itemId = payload;
  }),

  products: ["transactions"],
  setProducts: action((state, payload) => {
    state.products = payload;
  }),

  linkTokenError: {
    error_type: "",
    error_code: "",
    error_message: "",
  },

  user: {
    id: "",
    hasAccessToken: false,
    PUBLIC_TOKEN: null,
    ITEM_ID: null,
    // The transfer_id is only relevant for Transfer ACH product.
    TRANSFER_ID: null,
    // The payment_id is only relevant for the UK/EU Payment Initiation product.
    PAYMENT_ID: null,
  },

  setUser: action((state, payload) => {
    state.user = { ...payload(state.user) };
  }),
});

export default store;

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreState = typedHooks.useStoreState;
