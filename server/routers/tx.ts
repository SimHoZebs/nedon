import type {
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest,
} from "plaid";
import { z } from "zod";

import db from "@/util/db";
import { convertToFullTx } from "@/util/tx";
import {
  type FullTxClientSide,
  type TxInDB,
  FullTxClientSideSchema,
} from "@/util/types";

import { procedure, router } from "../trpc";
import { client } from "../util";
import { SplitSchema } from "prisma/generated/zod";

const txRouter = router({
  getWithoutPlaid: procedure
    .input(z.object({ userId: z.string(), txId: z.string() }))
    .query(async ({ input }) => {
      const txInDB = await db.tx.findUnique({
        where: {
          id: input.txId,
        },
        include: {
          splitArray: {
            include: {
              catArray: true,
            },
          },
        },
      });

      if (!txInDB) return null;

      return txInDB;
    }),

  getAll: procedure
    .input(z.object({ id: z.string(), cursor: z.string().optional() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({ where: { id: input.id } });
      if (!user || !user.ACCESS_TOKEN) return null;

      // New tx updates since "cursor"
      let added: Transaction[] = [];
      let modified: Transaction[] = [];
      // Removed tx ids
      let removed: RemovedTransaction[] = [];
      let hasMore = true;
      let cursor = input.cursor;

      // Iterate through each page of new tx updates for item
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
        hasMore = false; //disabling fetch for over 100 txs

        // Update cursor to the next cursor
        cursor = data.next_cursor;
      }

      const txArray: TxInDB[] = await db.tx.findMany({
        where: {
          ownerId: user.id,
        },
        include: {
          splitArray: {
            include: {
              catArray: true,
            },
          },
        },
      });

      const full: FullTxClientSide[] = added.map((plaidTx) => {
        const matchingTx = txArray.find(
          (tx) => tx.plaidId === plaidTx.transaction_id,
        );

        return convertToFullTx(user.id, plaidTx, matchingTx);
      });

      return full;
    }),

  //all tx meta including the user
  getAllAssociated: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.tx.findMany({
        where: {
          splitArray: {
            //TODO: is some correct? or every?
            some: {
              userId: input.id,
            },
          },
          ownerId: input.id,
        },

        include: {
          splitArray: {
            include: {
              catArray: true,
            },
          },
        },
      });
    }),

  create: procedure
    .input(FullTxClientSideSchema)
    .mutation(async ({ input }) => {
      const data = {
        plaidId: input.plaidId,
        ownerId: input.ownerId,
        id: input.txId,
      };

      const tx = await db.tx.create({
        data: {
          ...data,
          splitArray: {
            create: input.splitArray.map((split) => ({
              userId: split.userId,
              plaidId: split.plaidId,
              catArray: {
                create: split.catArray.map((cat) => ({
                  name: cat.name,
                  amount: cat.amount,
                })),
              },
            })),
          },
        },
        include: {
          splitArray: {
            include: {
              catArray: true,
            },
          },
        },
      });

      return tx;
    }),

  //createMeta could've been modified instead but this avoids accidentally missing txId for Plaid txs.
  createManually: procedure
    .input(
      z.object({
        userId: z.string(),
        splitArray: z.array(SplitSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const tx = await db.tx.create({
        data: {
          owner: {
            connect: {
              id: input.userId,
            },
          },
          splitArray: {
            create: input.splitArray.map((split) => ({
              ...split,
            })),
          },
        },
      });

      return tx;
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.tx.delete({
        where: {
          id: input.id,
        },
      });
    }),

  deleteAll: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.tx.deleteMany({
        where: {
          ownerId: input.id,
        },
      });
    }),
});

export default txRouter;
