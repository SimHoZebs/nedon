import type {
  ConnectionCompletion,
  ConnectionFlow,
  FinancialDataProvider,
  ProviderConnection,
  ProviderSyncResult,
} from "../../types";
import client from "./plaidClient";
import { PLAID_COUNTRY_CODES, PLAID_PRODUCTS } from "./plaidConfig";
import { mapPlaidAccount, mapPlaidTransaction } from "./plaidMappers";

import type { PlaidApi, RemovedTransaction, Transaction } from "plaid";
import { PlaidErrorType } from "plaid";

const maxPaginationRetries = 3;

export class PlaidProvider implements FinancialDataProvider {
  readonly id = "PLAID" as const;

  constructor(private readonly plaid: PlaidApi = client) {}

  async beginConnection(userId: string): Promise<ConnectionFlow> {
    const response = await this.plaid.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Nedon",
      products: PLAID_PRODUCTS,
      country_codes: PLAID_COUNTRY_CODES,
      language: "en",
    });
    return { type: "embedded", token: response.data.link_token };
  }

  async completeConnection(
    completion: ConnectionCompletion,
  ): Promise<ProviderConnection> {
    if (completion.type !== "embeddedToken") {
      throw new Error("Plaid requires an embedded connection token");
    }
    const response = await this.plaid.itemPublicTokenExchange({
      public_token: completion.token,
    });
    return {
      externalId: response.data.item_id,
      credential: response.data.access_token,
    };
  }

  async sync(input: {
    credential: string;
    checkpoint: string | null;
    startDate: Date;
  }): Promise<ProviderSyncResult> {
    const accountsResponse = await this.plaid.accountsGet({
      access_token: input.credential,
    });
    const accounts = accountsResponse.data.accounts.map(mapPlaidAccount);
    const startingCursor = input.checkpoint || undefined;
    let cursor = startingCursor;
    let retries = 0;

    while (true) {
      const added: Transaction[] = [];
      const modified: Transaction[] = [];
      const removed: RemovedTransaction[] = [];
      let hasMore = true;

      try {
        while (hasMore) {
          const response = await this.plaid.transactionsSync({
            access_token: input.credential,
            cursor,
            count: 500,
          });
          added.push(...response.data.added);
          modified.push(...response.data.modified);
          removed.push(...response.data.removed);
          cursor = response.data.next_cursor;
          hasMore = response.data.has_more;
        }

        return {
          mode: "delta",
          accounts,
          upserted: [...added, ...modified].map(mapPlaidTransaction),
          removed: removed.map((transaction) => ({
            externalId: transaction.transaction_id,
            externalAccountId: null,
          })),
          checkpoint: cursor || null,
        };
      } catch (error) {
        const data =
          typeof error === "object" && error && "response" in error
            ? (
                error.response as {
                  data?: { error_type?: string; error_code?: string };
                }
              ).data
            : undefined;
        const paginationChanged =
          data?.error_type === PlaidErrorType.TransactionsError &&
          data.error_code === "TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION";
        if (!paginationChanged || retries >= maxPaginationRetries) throw error;
        retries += 1;
        cursor = startingCursor;
      }
    }
  }
}

export const plaidProvider = new PlaidProvider();
