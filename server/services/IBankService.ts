import type { Result } from "@/util/type";

export interface GenericBankTransaction {
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
  raw?: any; // To store the original connector's raw data, e.g. plaid transaction for migrations or direct access
}

export interface GenericRemovedBankTransaction {
  id: string;
}

export interface GenericAccount {
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
  getAuth(accessToken: string): Promise<{ accounts: GenericAccount[] }>;
  getTxSyncData(
    accessToken: string,
    cursor?: string,
  ): Promise<{
    added: GenericBankTransaction[];
    modified: GenericBankTransaction[];
    removed: GenericRemovedBankTransaction[];
    cursor?: string;
  } | null>;
}
