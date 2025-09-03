import type { User } from "@prisma/client";
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  PlaidErrorType,
  Products,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
} from "plaid";
import type { CatModelType } from "prisma/generated/schemas";

const APP_PORT = process.env.APP_PORT || 8000;
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
export const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(",") as Products[];

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
export const PLAID_COUNTRY_CODES = (
  process.env.PLAID_COUNTRY_CODES || CountryCode.Us
).split(",") as CountryCode[];

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
