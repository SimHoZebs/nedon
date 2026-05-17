import type { Result } from "@/util/type";

import type { RemovedTransaction, Transaction } from "plaid";

// Using plaid specific types here, we could potentially abstract these out
// further if we were to add more banking integrations, but for now we'll
// stick with plaid types as the interface contract.
export interface IBankService {
  createLinkToken(): Promise<string>;
  getTokensAndIds(): Promise<
    Result<
      {
        publicToken: string;
        accessToken: string;
        itemId: string;
        transferId: string | null;
      },
      unknown
    >
  >;
  getAuth(accessToken: string): Promise<any>;
  getTxSyncData(
    accessToken: string,
    cursor?: string,
  ): Promise<{
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    cursor?: string;
  } | null>;
}
