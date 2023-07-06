import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import { RemovedTransaction, TransactionsSyncRequest } from "plaid";
import { PlaidTransaction } from "../../lib/util/types";
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
      while (hasMore) {
        const request: TransactionsSyncRequest = {
          access_token: user.ACCESS_TOKEN,
          cursor: cursor,
          count: 50,
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
    }),

  //only transactions owned by user
  getMeta: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.transaction.findMany({
        where: {
          ownerId: input.id,
        },
        include: {
          splitArray: true,
        },
      });
    }),

  //all transaction meta including the user
  getAssociatedMeta: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.transaction.findMany({
        where: {
          splitArray: {
            some: {
              userId: input.id,
            },
          },
        },

        include: {
          splitArray: true,
        },
      });
    }),

  updateCategory: procedure
    .input(
      z.object({
        transactionId: z.string(),
        categoryArray: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const updatedTransaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          categoryArray: input.categoryArray,
        },
      });

      return updatedTransaction;
    }),

  updateSplit: procedure
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
        splitArray: z
          .array(SplitModel.extend({ id: z.string().nullable() }))
          .optional(),
        categoryArray: z.array(z.string()),
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
          categoryArray: input.categoryArray,
        },
      });

      input.splitArray &&
        (await db.split.createMany({
          data: input.splitArray.map(({ id, ...rest }) => ({
            ...rest,
          })),
        }));

      return transaction;
    }),

  //createMeta could've been modified instead but this avoids accidentally missing transactionId for Plaid transactions.
  createManualTransaction: procedure
    .input(
      z.object({
        userId: z.string(),
        splitArray: z.array(
          SplitModel.extend({
            id: z.undefined(),
            transactionId: z.undefined(),
          })
        ),
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
        },
      });

      await db.split.createMany({
        data: input.splitArray.map(({ id, ...rest }) => ({
          ...rest,
          transactionId: transaction.id,
        })),
      });

      return transaction;
    }),
});

export default transactionRouter;
