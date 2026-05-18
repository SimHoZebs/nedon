import type { Result } from "@/util/type";

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  name: string;
  merchantName?: string | null;
  pending: boolean;
  category?: {
    primary: string;
    detailed?: string;
  } | null;
  paymentChannel?: string | null;
  authorizedDate?: string | null;
  raw?: any; // To store the original connector's raw data
}

export interface RemovedBankTransaction {
  id: string;
}

export interface BankAccount {
  id: string;
  name: string;
  mask?: string | null;
  type: string;
  subtype?: string | null;
  balances: {
    available?: number | null;
    current?: number | null;
    limit?: number | null;
    isoCurrencyCode?: string | null;
  };
  raw?: any;
}

export interface BankSyncResult {
  upserted: BankTransaction[];
  removed: RemovedBankTransaction[];
  nextSyncToken?: string;
}

export interface BankConnectionData {
  accessToken: string;
  publicToken?: string; // Optional because not all providers use this
  itemId?: string; // Provider-specific connection ID
  transferId?: string | null;
  [key: string]: any; // Catch-all for provider-specific properties
}

export interface IBankService {
  /**
   * Initializes a connection flow (e.g. creates a link token for Plaid).
   * Returns a token or URL to be used by the frontend.
   */
  createConnectionIntent(): Promise<string>;

  /**
   * Establishes a sandbox connection, typically returning access tokens.
   * Useful for testing environments where no interactive user login is needed.
   */
  establishSandboxConnection(): Promise<
    Result<
      BankConnectionData,
      unknown
    >
  >;

  /**
   * Fetches the accounts associated with the connection.
   */
  getAccounts(accessToken: string): Promise<{ accounts: BankAccount[] }>;

  /**
   * Synchronizes transactions since the last sync token.
   */
  syncTransactions(
    accessToken: string,
    syncToken?: string,
  ): Promise<BankSyncResult | null>;
}
