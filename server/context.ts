import { financialDataService } from "./financial";
import type { FinancialDataService } from "./financial/FinancialDataService";

import type * as trpcNext from "@trpc/server/adapters/next";

export interface Context {
  financialDataService: FinancialDataService;
}

export const createContext = async (
  _opts?: trpcNext.CreateNextContextOptions,
): Promise<Context> => {
  return {
    financialDataService,
  };
};
