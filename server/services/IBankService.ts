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
  logoUrl?: string | null;
  isoCurrencyCode?: string | null;
  location?: {
    address?: string | null;
    city?: string | null;
    region?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  raw?: any;
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

export interface IBankService {
  createConnectionIntent(userId: string): Promise<string>;
  establishConnection(userId: string): Promise<Result<void, unknown>>;
  getAccounts(userId: string): Promise<{ accounts: BankAccount[] }>;
  syncTransactions(
    userId: string,
    dateString: string,
  ): Promise<Result<void, unknown>>;
}
