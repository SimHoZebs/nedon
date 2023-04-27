import { action, createStore, Action, createTypedHooks } from "easy-peasy";

interface StoreModel {
  linkSuccess: boolean;
  setLinkSuccess: Action<StoreModel, boolean>;

  isItemAccess: boolean;

  isPaymentInitiation: boolean;
  setIsPaymentInitiation: Action<StoreModel, boolean>;

  linkToken: string | null;
  setLinkToken: Action<StoreModel, string | null>;

  accessToken: string | null;
  itemId: string | null;
  isError: boolean;
  backend: boolean;
  products: string[];
  setProducts: Action<StoreModel, string[]>;

  linkTokenError: {
    error_message: string;
    error_code: string;
    error_type: string;
  };
}

const store = createStore<StoreModel>({
  linkSuccess: false,
  setLinkSuccess: action((state, payload) => {
    state.linkSuccess = payload;
  }),

  isItemAccess: true,
  isPaymentInitiation: false,
  setIsPaymentInitiation: action((state, payload) => {
    state.isPaymentInitiation = payload;
  }),

  linkToken: "", // Don't set to null or error message will show up briefly when site loads
  setLinkToken: action((state, payload) => {
    state.linkToken = payload;
  }),

  accessToken: null,
  itemId: null,
  isError: false,
  backend: true,

  products: ["transactions"],
  setProducts: action((state, payload) => {
    state.products = payload;
  }),

  linkTokenError: {
    error_type: "",
    error_code: "",
    error_message: "",
  },
});

export default store;

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreState = typedHooks.useStoreState;
