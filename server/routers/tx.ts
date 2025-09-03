import { TxInDBSchema, UnsavedTxInDBSchema, UnsavedTxSchema } from "@/types/tx";
import db from "@/util/db";
import { resetTx } from "@/util/tx";
import {
  createTxInDBInput,
  mergePlaidTxWithTxArray,
  txInclude,
} from "server/util/tx";
import { z } from "zod";
import { procedure, router } from "../trpc";
import { createCatInput, getPlaidTxSyncData } from "../util/plaid";

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

  /*
   * Fetches PlaidTx, converts them to Tx,
   * */
  getAll: procedure
    .input(z.object({ id: z.string(), date: z.string() }))
    .query(async ({ input }) => {
      try {
        const user = await db.user.findFirst({ where: { id: input.id } });
        if (!user) {
          console.log("No user found with id: ", input.id);
          return null;
        }

        const txSyncResponse = await getPlaidTxSyncData(user);
        if (!txSyncResponse) return null;

        const res = await mergePlaidTxWithTxArray(
          txSyncResponse,
          user,
          input.date,
        );
        if (!res) return null;
        const { txArray, cursor } = res;

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
