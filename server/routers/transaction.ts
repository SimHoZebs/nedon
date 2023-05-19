import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import {
  RemovedTransaction,
  Transaction,
  Transaction as TransactionPlaid,
} from "plaid";
import { client } from "../util";
import { TransactionModel } from "../../prisma/zod";

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactionRouter = router({
  getDB: procedure
    .input(z.object({ id: z.string(), scope: z.string().or(z.undefined()) }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!user || !user.ACCESS_TOKEN) return null;

      //for now, just fetching from Plaid, but might want to store this somewhere on db
      const auth = (await client.authGet({ access_token: user.ACCESS_TOKEN }))
        .data;

      const transactionArray: TransactionPlaid[] = [];

      auth.accounts.forEach(async (account) => {
        const response = await db.transaction.findMany({
          where: {
            account_id: account.account_id,
          },
          include: {
            location: true,
            payment_meta: true,
          },
        });

        transactionArray.push(...(response as Transaction[])); //enforced as location is unintentionally nullable in db.
      });

      return transactionOrganizedByTime(transactionArray);
    }),

  //directly get transaction info from Plaid instead of DB. Updates user's cursor.
  getFresh: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!user || !user.ACCESS_TOKEN) return null;

      // New transaction updates since "cursor"
      let added: TransactionPlaid[] = [];
      let modified: TransactionPlaid[] = [];
      // Removed transaction ids
      let removed: RemovedTransaction[] = [];
      let hasMore = true;
      let cursor = user.cursor ? user.cursor : undefined;

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

      return { added, modified, removed, cursor };
    }),

  syncDB: procedure
    .input(
      z.object({
        id: z.string(),
        cursor: z.string(),
        db: z.array(TransactionModel),
        fresh: z.object({
          added: z.array(TransactionModel),
          modified: z.array(TransactionModel),
          removed: z.array(z.string()),
        }),
      })
    )
    .query(async ({ input }) => {
      //update user's cursor
      await db.user.update({
        where: {
          id: input.id,
        },
        data: {
          cursor: input.cursor,
        },
      });

      await db.transaction.createMany({ data: [...input.fresh.added] });

      input.fresh.modified.forEach(async (transaction) => {
        db.transaction.updateMany({
          where: {
            account_id: transaction.account_id,
          },
          data: {},
        });
      });
    }),
});

export const transactionOrganizedByTime = (
  transactionArray: TransactionPlaid[]
) => {
  const timeSortedTransaction = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
  );
  //create an object called sortedTransaction.
  const test: TransactionPlaid[][][][] = [[[[]]]];
  let lastDate = new Date(0);
  let yearIndex = -1;
  let monthIndex = -1;
  let dayIndex = -1;

  timeSortedTransaction.forEach((transaction, i) => {
    const date = new Date(transaction.date);

    if (lastDate.getFullYear() !== date.getFullYear()) {
      yearIndex++;
      monthIndex = -1;
      dayIndex = -1;
      test[yearIndex] = [];
    }
    if (lastDate.getMonth() !== date.getMonth()) {
      monthIndex++;
      dayIndex = -1;
      test[yearIndex][monthIndex] = [];
    }
    if (lastDate.getDate() !== date.getDate()) {
      dayIndex++;
      test[yearIndex][monthIndex][dayIndex] = [];
    }

    test[yearIndex][monthIndex][dayIndex].push(transaction);

    lastDate = date;
  });

  return test;
};

export default transactionRouter;
