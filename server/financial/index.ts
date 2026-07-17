import { FinancialDataService } from "./FinancialDataService";
import { financialSyncService } from "./FinancialSyncService";
import { ProviderRegistry } from "./providerRegistry";
import { plaidProvider } from "./providers/plaid/PlaidProvider";
import { simpleFinProvider } from "./providers/simplefin/SimpleFinProvider";

export const financialDataService = new FinancialDataService(
  new ProviderRegistry([plaidProvider, simpleFinProvider]),
  financialSyncService,
);
