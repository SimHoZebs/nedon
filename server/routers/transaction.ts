import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import { RemovedTransaction, Transaction as PlaidTransaction } from "plaid";
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
      let added: PlaidTransaction[] = [];
      let modified: PlaidTransaction[] = [];
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
        include: {
          splitArray: true,
        },
      });

      if (!transaction) return null;

      return transaction;
    }),

  updateMeta: procedure
    .input(
      z.object({
        transactionId: z.string(),
        splitArray: z.array(SplitModel.extend({ id: z.string().nullable() })),
      })
    )
    .mutation(async ({ input }) => {
      const updatedTransactionArray = await db.$transaction(
        input.splitArray.map(({ id, ...rest }) =>
          id === null
            ? db.split.create({
                data: rest,
              })
            : db.split.update({
                where: {
                  id,
                },
                data: rest,
              })
        )
      );

      return updatedTransactionArray;
    }),

  createMeta: procedure
    .input(
      z.object({
        userId: z.string(),
        transactionId: z.string(),
        splitArray: z.array(SplitModel.extend({ id: z.string().nullable() })),
      })
    )
    .mutation(async ({ input }) => {
      const transaction = await db.transaction.create({
        data: {
          owner: {
            connect: {
              id: input.userId,
            },
          },
          id: input.transactionId,
        },
      });

      await db.split.createMany({
        data: input.splitArray.map(({ id, ...rest }) => ({
          ...rest,
        })),
      });

      return transaction;
    }),
});

export const organizeTransactionByTime = (
  transactionArray: PlaidTransaction[]
) => {
  const timeSortedTransaction = transactionArray.sort(
    (a, b) =>
      new Date(b.datetime ? b.datetime : b.date).getTime() -
      new Date(a.datetime ? a.datetime : a.date).getTime()
  );
  //create an object called sortedTransaction.
  const test: PlaidTransaction[][][][] = [[[[]]]];
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
