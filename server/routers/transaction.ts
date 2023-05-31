import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import { RemovedTransaction, Transaction } from "plaid";
import { client } from "../util";
import { SplitModel } from "../../prisma/zod";

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactionRouter = router({
  getAll: procedure
    .input(z.object({ id: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!user || !user.ACCESS_TOKEN) return null;

      // New transaction updates since "cursor"
      let added: Transaction[] = [];
      let modified: Transaction[] = [];
      // Removed transaction ids
      let removed: RemovedTransaction[] = [];
      let hasMore = true;
      let cursor = input.cursor;

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

      return organizeTransactionByTime(added);
    }),

  getMeta: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const transaction = await db.transaction.findMany({
        where: {
          ownerId: input.id,
        },
      });

      if (!transaction) return null;

      return transaction;
    }),

  //FIX: updateMeta needs to update many splits. Look into $transactions
  updateMeta: procedure
    .input(
      z.object({
        transactionId: z.string(),
        split: SplitModel,
      })
    )
    .mutation(async ({ input }) => {
      const transaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          split: {
            updateMany: {
              where: {
                id: input.split.id,
              },
              data: {},
            },
          },
        },
      });

      return transaction;
    }),

  //FIX: multiple splits expected to be created and connected to Transaction
  createMeta: procedure
    .input(
      z.object({
        groupId: z.string(),
        transactionId: z.string(),
        splitAmount: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      console.log("mutating");

      const splitUserArray = await db.user.findMany({
        where: {
          groupArray: {
            some: {
              id: input.groupId,
            },
          },
        },
      });

      const test = await db.transaction.create({
        data: {
          id: input.transactionId,
          splitUserArray: {
            connect: splitUserArray.map((user) => ({
              id: user.id,
            })),
          },
          splitAmount: input.splitAmount,
        },
      });

      return test;
    }),
});

export const organizeTransactionByTime = (transactionArray: Transaction[]) => {
  const timeSortedTransaction = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
  );
  //create an object called sortedTransaction.
  const test: Transaction[][][][] = [[[[]]]];
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
