import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "@/util/db";
import {
  RemovedTransaction,
  Transaction as PlaidTransaction,
  TransactionsSyncRequest,
} from "plaid";
import { FullTransaction, SplitClientSideModel } from "@/util/types";
import { client } from "../util";
import { SplitModel } from "../../prisma/zod";
import { Transaction } from "@prisma/client";
import { emptyCategory } from "@/util/category";

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

      const transactionArray: Transaction[] = await db.transaction.findMany({
        where: {
          ownerId: user.id,
        },
        include: {
          splitArray: true,
        },
      });

      const splitArray = await db.split.findMany({
        where: {
          transactionId: {
            in: transactionArray.map((transaction) => transaction.id),
          },
        },
        include: {
          categoryArray: true,
        },
      });

      const full: FullTransaction[] = added.map((plaidTransaction) => {
        const result: FullTransaction = {
          ...plaidTransaction,
          id: plaidTransaction.transaction_id,
          ownerId: user.id,
          inDB: false,
          splitArray: [
            {
              id: null,
              transactionId: plaidTransaction.transaction_id,
              categoryArray: [
                emptyCategory({
                  nameArray: plaidTransaction.category || [],
                  splitId: null,
                  amount: plaidTransaction.amount,
                }),
              ],
              userId: user.id,
            },
          ],
        };

        const matchingTransaction = transactionArray.find(
          (transaction) => transaction.id === plaidTransaction.transaction_id
        );

        if (matchingTransaction) result.inDB = true;

        if (splitArray.length === 0) {
          return result;
        }

        const matchingSplitArray = splitArray.filter(
          (split) => split.transactionId === plaidTransaction.transaction_id
        );

        if (matchingSplitArray.length) {
          matchingSplitArray.forEach((matchingSplit) => {
            const matchingIndex = splitArray.findIndex(
              (split) => split.id === matchingSplit.id
            );
            splitArray.splice(matchingIndex, 1);
          });

          result.splitArray = matchingSplitArray.map((split) => ({
            ...split,
          }));
        }

        return result;
      });

      return full;
    }),

  //all transaction meta including the user
  getAllAssociated: procedure
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

  create: procedure
    .input(
      z.object({
        userId: z.string(),
        transactionId: z.string(),
        splitArray: z.array(SplitClientSideModel),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        ownerId: input.userId,
        id: input.transactionId,
      };

      const splitArrayData = input.splitArray?.map(({ userId, ...rest }) => ({
        userId,
      }));

      const transaction = await db.transaction.create({
        data: {
          ...data,
          splitArray: splitArrayData
            ? {
                createMany: {
                  data: input.splitArray.map((split) => ({
                    userId: split.userId,
                  })),
                },
              }
            : undefined,
        },
        include: {
          splitArray: {},
        },
      });

      db.$transaction(
        transaction.splitArray.map((split, index) =>
          db.category.createMany({
            data: input.splitArray[index].categoryArray.map((category) => ({
              splitId: split.id,
              nameArray: category.nameArray,
              amount: category.amount,
            })),
          })
        )
      );

      return transaction;
    }),

  //createMeta could've been modified instead but this avoids accidentally missing transactionId for Plaid transactions.
  createManually: procedure
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
