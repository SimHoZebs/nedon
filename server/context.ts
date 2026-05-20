import type { IBankService } from "./services/IBankService";
import { plaidBankService } from "./services/PlaidBankService";

import type * as trpcNext from "@trpc/server/adapters/next";

export interface Context {
  bankService: IBankService;
}

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions,
): Promise<Context> => {
  return {
    bankService: plaidBankService,
  };
};
