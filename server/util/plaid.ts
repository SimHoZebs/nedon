import {
  PlaidErrorType,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
} from "plaid";
import plaidClient from "server/clients/plaidClient";

/**
 * Fetches new and updated transactions from Plaid since the last cursor.
 * returns null if there was an error.
 */
export const getPlaidTxSyncData = async (
  accessToken: string,
  cursor?: string,
) => {
  // New tx updates since "cursor"
  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  // Removed tx ids
  let removed: RemovedTransaction[] = [];
  let totalCount = 100;
  let hasMore = true;

  while (hasMore && totalCount > 0) {
    const request: TransactionsSyncRequest = {
      access_token: accessToken,
      cursor: cursor,
      count: totalCount,
    };

    try {
      console.log(
        `syncing ${request.count} transactions with cursor ${request.cursor} and accessToken ${request.access_token}`,
      );
      const response = await plaidClient.transactionsSync(request);
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
        console.error(
          `${PlaidErrorType.TransactionError}, Resetting sync cursor`,
        );
        cursor = cursor || undefined;
      } else {
        console.error("Error in transactionsSync: ", error);
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
