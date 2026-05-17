import type { IBankService } from "./services/IBankService";
import { PlaidBankService } from "./services/PlaidBankService";

import type * as trpcNext from "@trpc/server/adapters/next";

export interface Context {
  bankService: IBankService;
}

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions,
): Promise<Context> => {
  return {
    bankService: new PlaidBankService(),
  };
};
