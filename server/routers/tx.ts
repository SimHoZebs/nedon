import type {
  RemovedTransaction,
  Transaction,
  TransactionsSyncRequest,
} from "plaid";
import { TxSchema } from "prisma/generated/zod";
import { z } from "zod";

import db from "@/util/db";
import { convertToFullTx } from "@/util/tx";
import {
  type FullTxClientSide,
  FullTxSchema,
  TxClientSideSchema,
  type TxInDB,
} from "@/util/types";

import { procedure, router } from "../trpc";
import { client } from "../util";

const txRouter = router({
  getWithoutPlaid: procedure
    .input(z.object({ userId: z.string(), txId: z.string() }))
    .query(async ({ input }) => {
      const txInDB = await db.tx.findUnique({
        where: {
          id: input.txId,
        },
        include: {
          catArray: true,
          splitArray: true,
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
          userId: user.id,
        },
        include: {
          catArray: true,
          splitArray: true,
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
          userId: input.id,
        },

        include: {
          catArray: true,
          splitArray: true,
        },
      });
    }),

  create: procedure.input(TxClientSideSchema).mutation(async ({ input }) => {
    const data = {
      plaidId: input.plaidId,
      userId: input.userId,
      id: input.txId,
    };

    const tx = await db.tx.create({
      data: {
        ...data,
        catArray: {
          create: input.catArray.map((cat) => ({
            name: cat.name,
            nameArray: cat.nameArray,
            amount: cat.amount,
          })),
        },
        splitArray: {
          create: input.splitArray.map((split) => ({
            userId: split.userId,
            amount: split.amount,
          })),
        },
      },
      include: {
        catArray: true,
        splitArray: true,
      },
    });

    return tx;
  }),

  update: procedure.input(FullTxSchema).mutation(async ({ input }) => {
    const tx = await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        plaidId: input.plaidId,
        catArray: {
          create: input.catArray.map((cat) => ({
            name: cat.name,
            nameArray: cat.nameArray,
            amount: cat.amount,
          })),
        },
        splitArray: {
          create: input.splitArray.map((split) => ({
            userId: split.userId,
            amount: split.amount,
          })),
        },
      },
      include: {
        catArray: true,
        splitArray: true,
      },
    });

    return tx;
  }),

  //createMeta could've been modified instead but this avoids accidentally missing txId for Plaid txs.
  createManually: procedure
    .input(TxClientSideSchema)
    .mutation(async ({ input }) => {
      const tx = await db.tx.create({
        data: {
          plaidId: input.plaidId,
          user: {
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
          userId: input.id,
        },
      });
    }),
});

export default txRouter;
