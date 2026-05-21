import type { Result } from "@/util/type";

import type { BankAccount } from "@/types/bank";

export interface IBankService {
  createConnectionIntent(userId: string): Promise<string>;
  exchangeConnectionToken(
    userId: string,
    publicToken: string,
  ): Promise<Result<void, unknown>>;
  establishConnection(userId: string): Promise<Result<void, unknown>>;
  getAccounts(userId: string): Promise<{ accounts: BankAccount[] }>;
  syncTransactions(
    userId: string,
    dateString: string,
  ): Promise<Result<void, unknown>>;
}
