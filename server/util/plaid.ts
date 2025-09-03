import type { User } from "@prisma/client";
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  PlaidErrorType,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
} from "plaid";
import type { CatModelType } from "prisma/generated/schemas";
import { PLAID_CLIENT_ID, PLAID_ENV, PLAID_SECRET } from "server/constants";

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)
const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

export const client = new PlaidApi(configuration);

export const createCatInput = (cat: CatModelType) => {
  return { name: cat.name, nameArray: cat.nameArray, amount: cat.amount };
};

/**
 * Fetches new and updated transactions from Plaid since the last cursor.
 * returns null if there was an error.
 */
export const getPlaidTxSyncData = async (user: User) => {
  if (!user.ACCESS_TOKEN) {
    console.log("No access token for user");
    return null;
  }

  // New tx updates since "cursor"
  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  // Removed tx ids
  let removed: RemovedTransaction[] = [];
  let cursor = user.cursor || undefined;
  let totalCount = 100;
  let hasMore = true;

  while (hasMore && totalCount > 0) {
    const request: TransactionsSyncRequest = {
      access_token: user.ACCESS_TOKEN,
      cursor: cursor,
      count: totalCount,
    };

    try {
      console.log(
        `syncing ${request.count} transactions with cursor ${request.cursor} and accessToken ${request.access_token}`,
      );
      const response = await client.transactionsSync(request);
      const data = response.data;
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      totalCount =
        totalCount -
        data.added.length -
        data.modified.length -
        data.removed.length;

      hasMore = data.has_more;

      // Update cursor to the next cursor
      cursor = data.next_cursor;
    } catch (error) {
      if (
        // biome-ignore lint/suspicious/noExplicitAny: because fuck making types for stupid errors
        (error as any).response.data.error_type ===
        PlaidErrorType.TransactionError
      ) {
        console.log(
          `${PlaidErrorType.TransactionError}, Resetting sync cursor`,
        );
        cursor = user.cursor || undefined;
      } else {
        console.log("Error in transactionsSync: ", error);
        return null;
      }
    }
  }

  return {
    added,
    modified,
    removed,
    cursor,
  };
};
