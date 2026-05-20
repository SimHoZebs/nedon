import type { Result } from "@/util/type";

import type { UnsavedTx } from "@/types/tx";

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
  raw?: unknown;
}

export interface BankSyncResult {
  upserted: UnsavedTx[];
  removed: RemovedBankTransaction[];
  nextSyncToken?: string;
}

export interface IBankService {
  createConnectionIntent(userId: string): Promise<string>;
  establishConnection(userId: string): Promise<Result<void, unknown>>;
  getAccounts(userId: string): Promise<{ accounts: BankAccount[] }>;
  syncTransactions(
    userId: string,
    dateString: string,
  ): Promise<Result<void, unknown>>;
}
