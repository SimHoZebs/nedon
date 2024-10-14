import {
  PlaidErrorType,
  type RemovedTransaction,
  type Transaction,
  type TransactionsSyncRequest,
} from "plaid";
import { z } from "zod";

import db from "@/util/db";
import { createTxFromPlaidTx, mergePlaidTxWithTx, resetTx } from "@/util/tx";

import {
  type TxInDB,
  TxInDBSchema,
  type UnsavedTx,
  UnsavedTxInDBSchema,
  UnsavedTxSchema,
} from "@/types/tx";

import { procedure, router } from "../trpc";
import { client } from "../util";

const createTxInDB = async (txClientSide: UnsavedTx): Promise<TxInDB> => {
  return await db.tx.create({
    data: {
      ...txClientSide,
      plaidTx: txClientSide.plaidTx || undefined,
      receipt: txClientSide.receipt
        ? {
            create: {
              ...txClientSide.receipt,
              items: {
                createMany: { data: txClientSide.receipt.items },
              },
            },
          }
        : undefined,
      splitArray: {
        create: txClientSide.splitArray.map((split) => ({
          ...split,
        })),
      },
      catArray: {
        create: txClientSide.catArray.map((cat) => ({
          ...cat,
        })),
      },
    },
    include: {
      catArray: true,
      splitArray: true,
      receipt: {
        include: {
          items: true,
        },
      },
    },
  });
};

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
          receipt: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!txInDB) return null;

      return txInDB;
    }),

  getAll: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const user = await db.user.findFirst({ where: { id: input.id } });
        if (!user || !user.ACCESS_TOKEN) return null;

        // New tx updates since "cursor"
        let added: Transaction[] = [];
        let modified: Transaction[] = [];
        // Removed tx ids
        let removed: RemovedTransaction[] = [];
        let hasMore = true;
        let cursor = user.cursor || undefined;

        // Iterate through each page of new tx updates for item
        while (hasMore) {
          const request: TransactionsSyncRequest = {
            access_token: user.ACCESS_TOKEN,
            cursor: cursor,
            count: 50,
          };

          try {
            const response = await client.transactionsSync(request);
            const data = response.data;
            // Add this page of results
            added = added.concat(data.added);
            modified = modified.concat(data.modified);
            removed = removed.concat(data.removed);

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

        // update cursor in db asynchonously
        db.user
          .update({
            where: { id: user.id },
            data: { cursor: cursor },
          })
          .then();

        // newly added txs gets created
        //FUTURE: make this somehow asynchoronous so users don't have to wait for all txs to be added to see their existing tx
        for (const plaidTx of added) {
          const newTx = createTxFromPlaidTx(user.id, plaidTx);
          await createTxInDB(newTx);
        }

        const txArray: TxInDB[] = await db.tx.findMany({
          where: {
            OR: [
              { userId: user.id },
              { splitArray: { some: { userId: user.id } } },
            ],
          },
          include: {
            catArray: true,
            splitArray: true,
            receipt: {
              include: {
                items: true,
              },
            },
          },
        });

        // modified txs gets updated and removed txs gets deleted
        for (const plaidTx of modified) {
          const matchingTxIndex = txArray.findIndex(
            (tx) => tx.plaidId === plaidTx.transaction_id,
          );
          if (matchingTxIndex !== -1) {
            console.log("Somehow there is no matching tx?");
            const newTx = mergePlaidTxWithTx(txArray[matchingTxIndex], plaidTx);
            createTxInDB(newTx).then();
          } else {
            const matchingTx = txArray[matchingTxIndex];

            await db.tx.update({
              where: {
                id: matchingTx.id,
              },
              data: {
                plaidId: matchingTx.plaidId,
                catArray: {
                  create: matchingTx.catArray.map((cat) => ({
                    name: cat.name,
                    nameArray: cat.nameArray,
                    amount: cat.amount,
                  })),
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

        include: {
          catArray: true,
          splitArray: true,
          receipt: {
            include: {
              items: true,
            },
          },
        },
      });
    }),

  create: procedure.input(UnsavedTxSchema).mutation(async ({ input }) => {
    return await createTxInDB(input);
  }),

  update: procedure.input(UnsavedTxInDBSchema).mutation(async ({ input }) => {
    const catToCreate = input.catArray.filter((cat) => !cat.id);
    const catToUpdate = input.catArray.filter((cat) => cat.id);
    const splitToCreate = input.splitArray.filter((split) => !split.id);
    const splitToUpdate = input.splitArray.filter((split) => split.id);
    console.log("input", input);

    const tx = await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        plaidId: input.plaidId,
        catArray: {
          createMany: {
            data: catToCreate.map((cat) => ({
              name: cat.name,
              nameArray: cat.nameArray,
              amount: cat.amount,
            })),
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
      include: {
        catArray: true,
        splitArray: true,
        receipt: {
          include: {
            items: true,
          },
        },
      },
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
        plaidId: newTx.plaidId,
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
      include: {
        catArray: true,
        splitArray: true,
        receipt: {
          include: {
            items: true,
          },
        },
      },
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
