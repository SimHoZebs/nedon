import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import { RemovedTransaction, Transaction } from "plaid";
import { client } from "../util";

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactionRouter = router({
  getAll: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!user || !user.ACCESS_TOKEN) return null;

      // Set cursor to empty to receive all historical updates
      let cursor = undefined;

      // New transaction updates since "cursor"
      let added: Transaction[] = [];
      let modified: Transaction[] = [];
      // Removed transaction ids
      let removed: RemovedTransaction[] = [];
      let hasMore = true;

      // Iterate through each page of new transaction updates for item
      //A page contains maximum of 100 transactions
      while (hasMore) {
        const request = {
          access_token: user.ACCESS_TOKEN,
          cursor: cursor,
        };

        const response = await client.transactionsSync(request);
        const data = response.data;
        // Add this page of results
        added = added.concat(data.added);
        modified = modified.concat(data.modified);
        removed = removed.concat(data.removed);

        // hasMore = data.has_more;
        hasMore = false; //disabling fetch for over 100 transactions

        // Update cursor to the next cursor
        cursor = data.next_cursor;
      }

      return added;
      // return added
      //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      //   .slice(-20);
    }),
});

export default transactionRouter;
