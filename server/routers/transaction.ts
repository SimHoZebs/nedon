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
import { CategoryTreeModel, SplitModel } from "../../prisma/zod";
import { CategoryTree } from "@prisma/client";

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
      });

      const categoryTreeArrayArray = await db.$transaction(
        transactionArray.map((transaction) =>
          db.categoryTree.findMany({
            where: {
              transactionId: transaction.id,
            },
            include: {
              splitArray: true,
            },
          })
        )
      );

      const transactionWithCategoryTreeArray = transactionArray.map(
        (transaction, index) => ({
          ...transaction,
          categoryTreeArray: categoryTreeArrayArray[index],
        })
      );

      const fullTransactionArray: FullTransaction[] = added.map(
        ({ category: nameArray, ...plaidTransaction }) => {
          const meta = transactionWithCategoryTreeArray.find(
            (t) => t.id === plaidTransaction.transaction_id
          );
          if (!nameArray) throw new Error("category is somehow falsy");

          let transaction: FullTransaction = {
            ...plaidTransaction,
            inDB: false,
            categoryTreeArray: [
              {
                transactionId: plaidTransaction.transaction_id,
                splitArray: [],
                id: null,
                nameArray,
                amount: plaidTransaction.amount,
              },
            ],
          };

          if (meta) {
            const { ownerId, categoryTreeArray, ...rest } = meta;
            transaction = { ...transaction, ...rest, inDB: true };
            if (categoryTreeArray.length)
              transaction.categoryTreeArray = categoryTreeArray;
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
          categoryTreeArray: {
            //TODO: is some correct? or every?
            some: {
              splitArray: {
                some: {
                  userId: input.id,
                },
              },
            },
          },
        },

        include: {
          categoryTreeArray: {
            include: {
              splitArray: true,
            },
          },
        },
      });
    }),

  upsertManyCategory: procedure
    .input(
      z.object({
        transactionId: z.string(),
        categoryTreeArray: z.array(
          CategoryTreeModel.extend({ id: z.string().nullish() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryTreeArray.filter(
        (category) => category.id
      ) as CategoryTree[];
      const categoryToCreateArray = input.categoryTreeArray.filter(
        (category) => !category.id
      ) as Omit<CategoryTree, "id">[];

      const upsertedTransaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          categoryTreeArray: {
            updateMany: categoryToUpdateArray.map(
              ({ id, transactionId, ...rest }) => ({
                where: {
                  id,
                },
                data: {
                  ...rest,
                },
              })
            ),
            createMany: {
              data: categoryToCreateArray.map(
                ({ transactionId, ...category }) => ({
                  ...category,
                  id: undefined,
                })
              ),
            },
          },
        },
        include: {
          categoryTreeArray: {
            include: {
              splitArray: true,
            },
          },
        },
      });

      return upsertedTransaction;
    }),

  createSplit: procedure
    .input(
      z.object({
        split: SplitModel.extend({ id: z.string().nullable() }),
      })
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
      })
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
          categoryTreeId: z.string(),
          userId: z.string(),
        })
      )
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
            categoryTreeId: input.categoryTreeId,
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
        categoryTreeArray: z
          .array(
            CategoryTreeModel.extend({ id: z.string().nullish() }).extend({
              splitArray: z
                .array(SplitModel.extend({ id: z.string().nullable() }))
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

      const categoryTreeArrayData = input.categoryTreeArray?.map(
        ({ id, transactionId, ...rest }) => ({
          ...rest,
        })
      );

      const transaction = await db.transaction.create({
        data: {
          ...data,
          categoryTreeArray: categoryTreeArrayData
            ? {
                createMany: {
                  data: categoryTreeArrayData,
                },
              }
            : undefined,
        },
        include: {
          categoryTreeArray: {
            include: {
              splitArray: true,
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
