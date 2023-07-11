import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import {
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest,
} from "plaid";
import { FullTransaction } from "../../lib/util/types";
import { client } from "../util";
import { CategoryModel, SplitModel } from "../../prisma/zod";
import { Category } from "@prisma/client";

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactionRouter = router({
  getTransactionArray: procedure
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

      const transactionArray = await db.transaction.findMany({
        where: {
          ownerId: input.id,
        },
        include: {
          categoryArray: true,
          splitArray: true,
        },
      });

      const fullTransactionArray: FullTransaction[] = added.map(
        ({ category, ...plaidTransaction }) => {
          const meta = transactionArray.find(
            (t) => t.id === plaidTransaction.transaction_id,
          );
          if (!category) throw new Error("category is somehow falsy");

          let transaction: FullTransaction = {
            ...plaidTransaction,
            inDB: false,
            splitArray: [],
            categoryArray: [
              {
                transactionId: plaidTransaction.transaction_id,
                id: null,
                categoryTree: category,
                amount: plaidTransaction.amount,
              },
            ],
          };

          if (meta) {
            const { ownerId, categoryArray, ...rest } = meta;
            transaction = { ...transaction, ...rest, inDB: true };
            if (categoryArray.length) transaction.categoryArray = categoryArray;
          }
          return transaction;
        },
      );

      return fullTransactionArray;
    }),

  //all transaction meta including the user
  getAssociatedTransactionArray: procedure
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

  upsertManyCategory: procedure
    .input(
      z.object({
        transactionId: z.string(),
        categoryArray: z.array(
          CategoryModel.extend({ id: z.string().nullish() }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryArray.filter(
        (category) => category.id,
      ) as Category[];
      const categoryToCreateArray = input.categoryArray.filter(
        (category) => !category.id,
      ) as Omit<Category, "id">[];

      const upsertedTransaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          categoryArray: {
            updateMany: categoryToUpdateArray.map(
              ({ id, transactionId, ...rest }) => ({
                where: {
                  id,
                },
                data: {
                  ...rest,
                },
              }),
            ),
            createMany: {
              data: categoryToCreateArray.map(
                ({ transactionId, ...category }) => ({
                  ...category,
                  id: undefined,
                }),
              ),
            },
          },
        },
        include: {
          categoryArray: true,
          splitArray: true,
        },
      });

      return upsertedTransaction;
    }),

  createSplit: procedure
    .input(
      z.object({
        split: SplitModel.extend({ id: z.string().nullable() }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input.split;
      await db.split.create({
        data: rest,
      });
    }),

  updateSplit: procedure
    .input(
      z.object({
        split: SplitModel.extend({ id: z.string().nullable() }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input.split;
      const updatedTransactionArray = id
        ? await db.split.update({
            where: {
              id,
            },
            data: rest,
          })
        : await db.split.create({
            data: rest,
          });

      return updatedTransactionArray;
    }),

  removeSplit: procedure
    .input(
      z.object({ splitId: z.string() }).or(
        z.object({
          transactionId: z.string(),
          userId: z.string(),
        }),
      ),
    )
    .mutation(async ({ input }) => {
      //why do I have to await any of them? Don't they resolve asynchronously?
      if ("splitId" in input) {
        await db.split.delete({
          where: {
            id: input.splitId,
          },
        });
      } else {
        //delete doesn't work because the query is not unique - even though it techincally is.
        await db.split.deleteMany({
          where: {
            transactionId: input.transactionId,
            userId: input.userId,
          },
        });
      }
    }),

  createTransaction: procedure
    .input(
      z.object({
        userId: z.string(),
        transactionId: z.string(),
        splitArray: z
          .array(SplitModel.extend({ id: z.string().nullable() }))
          .optional(),
        categoryArray: z
          .array(CategoryModel.extend({ id: z.string().nullish() }))
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const data = {
        ownerId: input.userId,
        id: input.transactionId,
      };

      const categoryArrayData = input.categoryArray?.map(
        ({ id, transactionId, ...rest }) => ({
          ...rest,
        }),
      );
      const splitArrayData = input.splitArray?.map(
        ({ id, transactionId, ...rest }) => ({
          ...rest,
        }),
      );

      const transaction = await db.transaction.create({
        data: {
          ...data,
          splitArray: splitArrayData
            ? {
                createMany: {
                  data: splitArrayData,
                },
              }
            : undefined,
          categoryArray: categoryArrayData
            ? {
                createMany: {
                  data: categoryArrayData,
                },
              }
            : undefined,
        },
        include: {
          splitArray: true,
          categoryArray: true,
        },
      });

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
          }),
        ),
      }),
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
