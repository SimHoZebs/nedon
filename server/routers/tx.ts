import type { Result } from "@/util/type";

import { type Tx, TxSchema, UnsavedTxSchema } from "@/types/tx";

import { procedure, router } from "../trpc";

import { convertPlaidCatToCat } from "lib/domain/cat";
import { resetTxToPlaidTx } from "lib/domain/tx";
import {
  createTxInput,
  mergePlaidTxWithTxArray,
  txInclude,
} from "server/domains/tx";
import { getPlaidTxSyncData } from "server/services/plaid";
import db from "server/util/db";
import { z } from "zod";

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
      let result: Result<Tx[] | null, unknown>;
      try {
        const user = await db.user.findFirst({ where: { id: input.id } });

        if (!user) {
          console.error("No user found with id: ", input.id);
          throw new Error("No user found");
        } else if (!user.accessToken) {
          console.error("No access token for user: ", input.id);
          throw new Error("No access token for user");
        }

        const plaidSyncResponse = await getPlaidTxSyncData(
          user.accessToken,
          user.cursor || undefined,
        );

        if (!plaidSyncResponse) throw new Error("No Plaid sync response");

        const res = await mergePlaidTxWithTxArray(
          plaidSyncResponse,
          user.id,
          input.date,
        );
        if (!res) throw new Error("Merging Plaid tx with db tx failed");
        const { txArray, cursor } = res;

        // update cursor in db asynchonously
        db.user
          .update({
            where: { id: user.id },
            data: { cursor: cursor },
          })
          .then();

        console.log("returning txArray", txArray.length);
        result = { ok: true, value: txArray };
      } catch (error) {
        console.error(error);
        console.error("Input: ", input);
        result = { ok: false, error };
      }
      return result;
    }),

  //all tx meta including the user
  getAllAssociated: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.tx.findMany({
        where: {
          ownerId: input.id,
        },

        include: txInclude,
      });
    }),

  create: procedure
    .input(UnsavedTxSchema)
    .output(TxSchema)
    .mutation(async ({ input }) => {
      return await db.tx.create(createTxInput(input));
    }),

  createMany: procedure
    .input(z.array(UnsavedTxSchema))
    .mutation(async ({ input }) => {
      const txCreateQueryArray = input.map((tx) => {
        return db.tx.create(createTxInput(tx));
      });

      return await db.$transaction(txCreateQueryArray);
    }),

  update: procedure.input(TxSchema).mutation(async ({ input }) => {
    const { catArray, splitTxArray: _splitTxArray, ...rest } = input;
    const { receipt: _receipt, plaidTx: _plaidTx, ...useful } = rest;
    const catToCreate = catArray.filter((cat) => !cat.id);
    const catToUpdate = catArray.filter((cat) => cat.id);

    const tx = await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        ...useful,
        plaidId: input.plaidId || undefined,
        catArray: {
          createMany: {
            data: catToCreate,
          },
          updateMany: catToUpdate.map(({ id, ...catWithoutId }) => ({
            where: { id: id },
            data: catWithoutId,
          })),
        },
      },
      include: txInclude,
    });

    return tx;
  }),

  reset: procedure.input(TxSchema).mutation(async ({ input }) => {
    const newTx = resetTxToPlaidTx(input);

    await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        ...newTx,
        plaidTx: newTx.plaidTx || undefined,
        plaidId: newTx.plaidId || undefined,
        splitTxArray: {
          deleteMany: {},
        },
        catArray: {
          deleteMany: {},
          create: newTx.plaidTx?.personal_finance_category
            ? convertPlaidCatToCat(
                newTx.plaidTx.personal_finance_category,
                newTx.id,
              )
            : undefined,
        },
        receipt: input.receipt
          ? {
              delete: {},
            }
          : undefined,
      },
    });

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
          ownerId: input.id,
        },
      });
    }),
});

export default txRouter;
