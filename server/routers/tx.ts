import type { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  PlaidErrorType,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
} from "plaid";
import { z } from "zod";

import db from "@/util/db";
import { createTxFromPlaidTx, resetTx } from "@/util/tx";

import {
  type TxInDB,
  TxInDBSchema,
  UnsavedTxInDBSchema,
  UnsavedTxSchema,
} from "@/types/tx";

import { procedure, router } from "../trpc";
import { client, createCatInput, createTxInDBInput, txInclude } from "../util";
import catRouter from "./cat";

const txSync = async (user: User) => {
  if (!user.ACCESS_TOKEN) {
    console.log("No access token for user");
    return null;
  }

  // New tx updates since "cursor"
  let added: Transaction[] = [];
  let modified: Transaction[] = [];
  // Removed tx ids
  let removed: RemovedTransaction[] = [];
  let cursor = user.cursor || undefined;
  let totalCount = 100;
  let hasMore = true;

  while (hasMore && totalCount > 0) {
    const request: TransactionsSyncRequest = {
      access_token: user.ACCESS_TOKEN,
      cursor: cursor,
      count: totalCount,
    };

    try {
      console.log(
        `syncing ${request.count} transactions with cursor ${request.cursor} and accessToken ${request.access_token}`,
      );
      const response = await client.transactionsSync(request);
      const data = response.data;
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      totalCount =
        totalCount -
        data.added.length -
        data.modified.length -
        data.removed.length;

      hasMore = data.has_more;

      // Update cursor to the next cursor
      cursor = data.next_cursor;
    } catch (error) {
      if (
        // biome-ignore lint/suspicious/noExplicitAny: because fuck making types for stupid errors
        (error as any).response.data.error_type ===
        PlaidErrorType.TransactionError
      ) {
        console.log(
          `${PlaidErrorType.TransactionError}, Resetting sync cursor`,
        );
        cursor = user.cursor || undefined;
      } else {
        console.log("Error in transactionsSync: ", error);
        return null;
      }
    }
  }
  return {
    added,
    modified,
    removed,
    cursor,
  };
};

const txRouter = router({
  getWithoutPlaid: procedure
    .input(z.object({ userId: z.string(), txId: z.string() }))
    .query(async ({ input }) => {
      const txInDB = await db.tx.findUnique({
        where: {
          id: input.txId,
        },
        include: txInclude,
      });

      if (!txInDB) return null;

      return txInDB;
    }),

  getAll: procedure
    .input(z.object({ id: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      try {
        const user = await db.user.findFirst({ where: { id: input.id } });
        if (!user) {
          console.log("No user found with id: ", input.id);
          return null;
        }

        // Iterate through each page of new tx updates for item
        const txSyncResponse = await txSync(user);
        if (!txSyncResponse) return null;

        const { added, modified, removed, cursor } = txSyncResponse;

        console.log(
          `added: ${added.length}, modified: ${modified.length}, removed: ${removed.length}`,
        );

        //at the moment it's impossible to have no cursor and have nothing added.
        // In the future, this would be a valid condition if the user just created an account without linking their bank account.
        if (!cursor && added.length < 1) return null;

        // newly added txs gets created
        //FUTURE: make this somehow asynchoronous so users don't have to wait for all txs to be added to see their existing tx
        const txCreateQueryArray = added.map((plaidTx) => {
          const newTx = createTxFromPlaidTx(user.id, plaidTx);
          return db.tx.create(createTxInDBInput(newTx));
        });
        try {
          await db.$transaction(txCreateQueryArray);
        } catch (error) {
          if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
              case "P2002":
                console.log(error.message);
                break;
              default:
                console.log("Error in creating tx: ", error);
                return null;
            }
          }
        }

        const date = new Date(input.date);

        const firstDayThisMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        );
        const lastDayThisMonth = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0,
        );

        const txArray: TxInDB[] = await db.tx.findMany({
          where: {
            OR: [
              { userId: user.id },
              { splitArray: { some: { userId: user.id } } },
              {
                recurring: true,
                userId: user.id,
                authorizedDatetime: {
                  gte: firstDayThisMonth.toISOString(),
                  lte: lastDayThisMonth.toISOString(),
                },
              },
            ],
          },
          include: txInclude,
        });

        // modified txs gets updated and removed txs gets deleted
        for (const plaidTx of modified) {
          const matchingTxIndex = txArray.findIndex(
            (tx) => tx.plaidId === plaidTx.transaction_id,
          );
          if (matchingTxIndex !== -1) {
            throw new Error(`Somehow there is no matching tx for ${plaidTx}`);
          }
          const matchingTx = txArray[matchingTxIndex];

          await db.tx.update({
            where: {
              id: matchingTx.id,
            },
            data: {
              plaidId: matchingTx.plaidId || undefined,
              catArray: {
                create: matchingTx.catArray.map((cat) => createCatInput(cat)),
              },
              splitArray: {
                create: matchingTx.splitArray.map((split) => ({
                  userId: split.userId,
                  amount: split.amount,
                })),
              },
            },
          });
        }

        for (const plaidTx of removed) {
          const matchingTxIndex = txArray.findIndex(
            (tx) => tx.plaidId === plaidTx.transaction_id,
          );
          if (matchingTxIndex !== -1) {
            txArray.splice(matchingTxIndex, 1);
            db.tx.delete({
              where: {
                id: txArray[matchingTxIndex].id,
              },
            });
          }
        }

        // update cursor in db asynchonously
        db.user
          .update({
            where: { id: user.id },
            data: { cursor: cursor },
          })
          .then();

        console.log("returning txArray", txArray.length);
        return txArray;
      } catch (error) {
        console.log(error);
        console.log("Input: ", input);
        return null;
      }
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

        include: txInclude,
      });
    }),

  create: procedure.input(UnsavedTxSchema).mutation(async ({ input }) => {
    return await db.tx.create(createTxInDBInput(input));
  }),

  createMany: procedure
    .input(z.array(UnsavedTxSchema))
    .mutation(async ({ input }) => {
      const txCreateQueryArray = input.map((tx) => {
        return db.tx.create(createTxInDBInput(tx));
      });

      return await db.$transaction(txCreateQueryArray);
    }),

  update: procedure.input(UnsavedTxInDBSchema).mutation(async ({ input }) => {
    const { catArray, splitArray, ...rest } = input;
    const { receipt, plaidTx, ...useful } = rest;
    const catToCreate = catArray.filter((cat) => !cat.id);
    const catToUpdate = catArray.filter((cat) => cat.id);
    const splitToCreate = splitArray.filter((split) => !split.id);
    const splitToUpdate = splitArray.filter((split) => split.id);
    console.log("input", input);

    const tx = await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        ...useful,
        plaidId: input.plaidId || undefined,
        catArray: {
          createMany: {
            data: catToCreate.map((cat) =>
              createCatInput({ ...cat, txId: input.id }),
            ),
          },
          updateMany: catToUpdate.map((cat) => ({
            where: { id: cat.id },
            data: {
              name: cat.name,
              nameArray: cat.nameArray,
              amount: cat.amount,
            },
          })),
        },

        splitArray: {
          createMany: {
            data: splitToCreate.map((split) => ({
              userId: split.userId,
              amount: split.amount,
            })),
          },
          updateMany: splitToUpdate.map((split) => ({
            where: { id: split.id },
            data: {
              userId: split.userId,
              amount: split.amount,
            },
          })),
        },
      },
      include: txInclude,
    });

    return tx;
  }),

  reset: procedure.input(TxInDBSchema).mutation(async ({ input }) => {
    const newTx = resetTx(input);

    await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        plaidId: newTx.plaidId || undefined,
        catArray: {
          deleteMany: {},
        },
        splitArray: {
          deleteMany: {},
        },
        receipt: input.receipt
          ? {
              delete: {},
            }
          : undefined,
      },
    });

    const createCat = db.cat.create({
      data: {
        name: newTx.catArray[0].name,
        nameArray: newTx.catArray[0].nameArray,
        amount: newTx.catArray[0].amount,
        txId: input.id,
      },
    });

    const createSplit = db.split.create({
      data: {
        userId: newTx.splitArray[0].userId,
        amount: newTx.splitArray[0].amount,
        txId: input.id,
        originTxId: input.id,
      },
    });

    await db.$transaction([createCat, createSplit]);

    return await db.tx.findUnique({
      where: {
        id: input.id,
      },
      include: txInclude,
    });
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
