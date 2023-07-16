import { action, createStore, Action, createTypedHooks } from "easy-peasy";
import { FullTransaction, GroupClientSide, UserClientSide } from "./types";

interface StoreModel {
  linkToken: string | null;
  setLinkToken: Action<StoreModel, string | null>;

  appUser?: UserClientSide;
  setAppUser: Action<
    StoreModel,
    (user: UserClientSide | undefined) => UserClientSide | undefined
  >;

  appGroup?: GroupClientSide;
  setAppGroup: Action<
    StoreModel,
    (group: GroupClientSide | undefined) => GroupClientSide | undefined
  >;

  verticalCategoryPicker: boolean;
  setVerticalCategoryPicker: Action<StoreModel, boolean>;

  currentTransaction: FullTransaction | undefined;
  setCurrentTransaction: Action<
    StoreModel,
    (transaction: FullTransaction | undefined) => FullTransaction | undefined
  >;
}

const store = createStore<StoreModel>({
  linkToken: "", // Don't set to null or error message will show up briefly when site loads
  setLinkToken: action((state, payload) => {
    state.linkToken = payload;
  }),

  appUser: undefined,
  setAppUser: action((state, payload) => {
    const newState = payload(state.appUser);

    state.appUser = newState ? { ...newState } : newState;
  }),

  appGroup: undefined,
  setAppGroup: action((state, payload) => {
    const newState = payload(state.appGroup);
    state.appGroup = newState ? { ...newState } : newState;
  }),

  verticalCategoryPicker: false,
  setVerticalCategoryPicker: action((state, payload) => {
    state.verticalCategoryPicker = payload;
  }),

  currentTransaction: undefined,
  setCurrentTransaction: action((state, payload) => {
    const newState = payload(state.currentTransaction);
    state.currentTransaction = newState;
  }),
});

export default store;

const typedHooks = createTypedHooks<StoreModel>();

export const useStoreActions = typedHooks.useStoreActions;
export const useStoreState = typedHooks.useStoreState;
