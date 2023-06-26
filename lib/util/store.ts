import { action, createStore, Action, createTypedHooks } from "easy-peasy";
import { GroupClientSide, UserClientSide } from "./types";
import { emptyUser } from "./user";

interface StoreModel {
  isItemAccess: boolean;
  setIsItemAccess: Action<StoreModel, boolean>;

  isPaymentInitiation: boolean;
  setIsPaymentInitiation: Action<StoreModel, boolean>;

  linkToken: string | null;
  setLinkToken: Action<StoreModel, string | null>;

  products: string[];
  setProducts: Action<StoreModel, string[]>;

  appUser: UserClientSide;
  setAppUser: Action<StoreModel, (user: UserClientSide) => UserClientSide>;

  appGroup: GroupClientSide | undefined;
  setAppGroup: Action<
    StoreModel,
    (group: GroupClientSide | undefined) => GroupClientSide | undefined
  >;
}

const store = createStore<StoreModel>({
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

  products: ["auth", "transactions"],
  setProducts: action((state, payload) => {
    state.products = payload;
  }),

  appUser: emptyUser,
  setAppUser: action((state, payload) => {
    state.appUser = payload(state.appUser);
  }),

  appGroup: undefined,
  setAppGroup: action((state, payload) => {
    state.appGroup = payload(state.appGroup);
  }),
});

export default store;

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreState = typedHooks.useStoreState;
