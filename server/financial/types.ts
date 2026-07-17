import { z } from "zod";

export const FinancialProviderSchema = z.enum(["PLAID", "SIMPLEFIN"]);
export type FinancialProvider = z.infer<typeof FinancialProviderSchema>;

export interface ExternalCategory {
  primary: string;
  detailed: string;
  description: string;
}

export interface ExternalAccount {
  externalId: string;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
  currentBalance: string | null;
  availableBalance: string | null;
  currency: string | null;
  balanceDate: Date | null;
}

export interface ExternalTransaction {
  externalId: string;
  externalAccountId: string;
  name: string;
  amount: string;
  postedAt: Date | null;
  authorizedAt: Date;
  pending: boolean;
  replacesExternalTransactionId: string | null;
  currency: string | null;
  logoUrl: string | null;
  location: {
    address: string | null;
    city: string | null;
    region: string | null;
    postalCode: string | null;
    country: string | null;
  };
  categories: ExternalCategory[];
}

export interface ExternalTransactionRef {
  externalId: string;
  externalAccountId: string | null;
}

export type ConnectionFlow =
  | { type: "embedded"; token: string }
  | { type: "tokenInput"; createUrl: string };

export type ConnectionCompletion =
  | { type: "embeddedToken"; token: string }
  | { type: "setupToken"; token: string };

export interface ProviderConnection {
  externalId: string | null;
  credential: string;
}

interface ProviderSyncBase {
  accounts: ExternalAccount[];
  checkpoint: string | null;
}

export interface DeltaProviderSync extends ProviderSyncBase {
  mode: "delta";
  upserted: ExternalTransaction[];
  removed: ExternalTransactionRef[];
}

export interface SnapshotProviderSync extends ProviderSyncBase {
  mode: "snapshot";
  transactions: ExternalTransaction[];
  observedFrom: Date;
  observedTo: Date;
  complete: boolean;
}

export type ProviderSyncResult = DeltaProviderSync | SnapshotProviderSync;

export interface FinancialDataProvider {
  readonly id: FinancialProvider;
  beginConnection(userId: string): Promise<ConnectionFlow>;
  completeConnection(
    completion: ConnectionCompletion,
  ): Promise<ProviderConnection>;
  sync(input: {
    credential: string;
    checkpoint: string | null;
    startDate: Date;
  }): Promise<ProviderSyncResult>;
}
