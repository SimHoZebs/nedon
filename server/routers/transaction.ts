import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import {
  RemovedTransaction,
  Transaction as PlaidTransaction,
  TransactionsSyncRequest,
} from "plaid";
import { FullTransaction } from "../../lib/util/types";
import { client } from "../util";
import { CategoryModel, SplitModel } from "../../prisma/zod";
import { Category, Split, Transaction } from "@prisma/client";
import { emptyCategory } from "../../lib/util/category";

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

      const transactionArray: Transaction[] = await db.transaction.findMany({
        where: {
          ownerId: input.id,
        },
      });

      const splitArrayArray: (Split & {
        categoryArray: Category[];
      })[][] = await db.$transaction(
        transactionArray.map((transaction) =>
          db.split.findMany({
            where: {
              transactionId: transaction.id,
            },
            include: {
              categoryArray: true,
            },
          })
        )
      );

      const transactionWithSplitArray: (Transaction & {
        splitArray: (Split & { categoryArray: Category[] })[];
      })[] = transactionArray.map((transaction, index) => ({
        ...transaction,
        splitArray: splitArrayArray[index],
      }));

      const fullTransactionArray: FullTransaction[] = added.map(
        ({ category: nameArray, ...plaidTransaction }) => {
          const meta = transactionWithSplitArray.find(
            (t) => t.id === plaidTransaction.transaction_id
          );
          if (!nameArray) throw new Error("category is somehow falsy");

          let transaction: FullTransaction = {
            ...plaidTransaction,
            inDB: false,
            splitArray: [
              {
                id: null,
                transactionId: plaidTransaction.transaction_id,
                categoryArray: [
                  emptyCategory({
                    splitId: null,
                    amount: plaidTransaction.amount,
                  }),
                ],
                userId: input.id,
              },
            ],
          };

          if (meta) {
            const { ownerId, splitArray, ...rest } = meta;
            transaction = { ...transaction, ...rest, inDB: true };
            if (splitArray.length) transaction.splitArray = splitArray;
          }
          return transaction;
        }
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
            //TODO: is some correct? or every?
            some: {
              userId: input.id,
            },
          },
        },

        include: {
          splitArray: {
            include: {
              categoryArray: true,
            },
          },
        },
      });
    }),

  createTransaction: procedure
    .input(
      z.object({
        userId: z.string(),
        transactionId: z.string(),
        splitArray: z
          .array(
            SplitModel.extend({ id: z.string().nullish() }).extend({
              CategoryModel: z
                .array(CategoryModel.extend({ id: z.string().nullable() }))
                .optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ownerId: input.userId,
        id: input.transactionId,
      };

      const splitArrayData = input.splitArray?.map(
        ({ id, CategoryModel, ...rest }) => ({
          ...rest,
        })
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
        },
        include: {
          splitArray: {
            include: {
              categoryArray: true,
            },
          },
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
