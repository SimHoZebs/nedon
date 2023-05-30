import { action, createStore, Action, createTypedHooks } from "easy-peasy";
import { GroupClientSide, UserClientSide } from "./types";
import { emptyUser } from "./user";

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

  user: UserClientSide;
  setUser: Action<StoreModel, (user: UserClientSide) => UserClientSide>;

  currentGroup?: GroupClientSide;
  setCurrentGroup: Action<
    StoreModel,
    (group?: GroupClientSide) => GroupClientSide
  >;
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

  user: emptyUser,
  setUser: action((state, payload) => {
    state.user = { ...payload(state.user) };
  }),

  currentGroup: undefined,
  setCurrentGroup: action((state, payload) => {
    state.currentGroup = { ...payload(state.currentGroup) };
  }),
});

export default store;

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreState = typedHooks.useStoreState;
