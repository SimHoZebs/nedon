import type { UnsavedTx } from "./tx";

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
