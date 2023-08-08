import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "@/util/db";
import { RemovedTransaction, TransactionsSyncRequest } from "plaid";
import {
  FullTransaction,
  SplitClientSideModel,
  PlaidTransaction,
} from "@/util/types";
import { client } from "../util";
import { SplitModel } from "../../prisma/zod";
import { convertToFullTransaction } from "@/util/transaction";

// Retrieve Transactions for an Item
// https://plaid.com/docs/#transactions
const transactionRouter = router({
  get: procedure
    .input(z.object({ userId: z.string(), plaidTransaction: z.unknown() }))
    .query(async ({ input }) => {
      function isPlaidTransaction(
        plaidTransaction: unknown
      ): plaidTransaction is FullTransaction {
        return (plaidTransaction as FullTransaction).id !== undefined;
      }

      if (!isPlaidTransaction(input.plaidTransaction)) return null;

      const transactionInDB = await db.transaction.findUnique({
        where: {
          id: input.plaidTransaction.id,
        },
        include: {
          splitArray: {
            include: {
              categoryArray: true,
            },
          },
        },
      });

      return {
        ...input.plaidTransaction,
        ...transactionInDB,
        inDB: !!transactionInDB,
      };
    }),

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

      const transactionArray = await db.transaction.findMany({
        where: {
          ownerId: user.id,
        },
        include: {
          splitArray: {
            include: {
              categoryArray: true,
            },
          },
        },
      });

      const full: FullTransaction[] = added.map((plaidTransaction) => {
        const matchingTransaction = transactionArray.find(
          (transaction) => transaction.id === plaidTransaction.transaction_id
        );

        return convertToFullTransaction(
          user.id,
          plaidTransaction,
          matchingTransaction
        );
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

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.transaction.delete({
        where: {
          id: input.id,
        },
      });
    }),

  deleteAll: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.transaction.deleteMany({
        where: {
          ownerId: input.id,
        },
      });
    }),
});

export default transactionRouter;
