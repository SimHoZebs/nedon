import type { Result } from "@/util/type";

import { type Tx, TxSchema, UnsavedTxSchema } from "@/types/tx";

import { procedure, router } from "../trpc";

import { TxKind } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { createCatWithoutTxInput } from "server/domains/cat";
import { createTxInput, txInclude } from "server/domains/tx";
import db from "server/util/db";
import { z } from "zod";

const txRouter = router({
  getWithoutBank: procedure
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

  syncWithBank: procedure
    .input(z.object({ userId: z.string(), date: z.date() }))
    .mutation(async ({ input, ctx }) => {
      let result: Result<void, unknown>;
      try {
        const syncResult = await ctx.bankService.syncTransactions(
          input.userId,
          input.date.toISOString(),
        );

        if (!syncResult.ok)
          throw new Error(`Bank sync failed: ${syncResult.error}`);

        return { ok: true, value: undefined };
      } catch (error) {
        if (error instanceof PrismaClientInitializationError) {
          result = { ok: false, error: "Database not initialized" };
          return result;
        }
        console.error(error);
        console.error("Input: ", input);
        result = { ok: false, error };
        return result;
      }
    }),

  getAll: procedure
    .input(z.object({ userId: z.string(), date: z.date() }))
    .query(async ({ input }) => {
      let result: Result<Tx[], unknown>;
      try {
        const user = await db.user.findFirst({ where: { id: input.userId } });

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

        const txArray = await db.tx.findMany({
          where: {
            OR: [
              { ownerId: input.userId },
              {
                kind: TxKind.USER,
                recurring: true,
                ownerId: input.userId,
                authorizedDatetime: {
                  gte: firstDayThisMonth.toISOString(),
                  lte: lastDayThisMonth.toISOString(),
                },
              },
            ],
            kind: TxKind.USER,
          },
          include: {
            catArray: true,
            receipt: {
              include: {
                items: true,
              },
            },
            originTx: true,
            splitTxArray: true,
          },
        });

        if (!user) {
          console.error("No user found with id: ", input.userId);
          throw new Error("No user found");
        } else if (!user.bankAccessToken) {
          console.error("No access token for user: ", input.userId);
          throw new Error("No access token for user");
        }

        console.log("returning txArray", txArray.length);
        result = { ok: true, value: txArray };
      } catch (error) {
        if (error instanceof PrismaClientInitializationError) {
          result = { ok: false, error: "Database not initialized" };
          return result;
        }
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
          kind: { not: TxKind.ORIGINAL },
        },

        include: txInclude,
      });
    }),

  create: procedure
    .input(UnsavedTxSchema)
    .output(TxSchema)
    .mutation(async ({ input }) => {
      return await db.tx.create({
        data: createTxInput(input),
        include: txInclude,
      });
    }),

  createMany: procedure
    .input(z.array(UnsavedTxSchema))
    .mutation(async ({ input }) => {
      const txCreateQueryArray = input.map((tx) => {
        return db.tx.create({ data: createTxInput(tx), include: txInclude });
      });

      return await db.$transaction(txCreateQueryArray);
    }),

  update: procedure.input(TxSchema).mutation(async ({ input }) => {
    const { catArray, splitTxArray: _splitTxArray, ...rest } = input;
    const {
      receipt: _receipt,
      originalBankTxId: _originalBankTxId,
      kind: _kind,

      ...useful
    } = rest;
    const catToCreate = catArray.filter((cat) => !cat.id);
    const catToUpdate = catArray.filter((cat) => cat.id);

    const tx = await db.tx.update({
      where: {
        id: input.id,
      },
      data: {
        ...useful,
        bankId: input.bankId || undefined,
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

  reset: procedure
    .input(z.object({ txId: z.string() }))
    .mutation(async ({ input }) => {
      const tx = await db.tx.findUnique({
        where: {
          id: input.txId,
        },
        include: {
          originalBankTx: {
            include: {
              catArray: true,
            },
          },
        },
      });

      if (!tx?.originalBankTx) {
        return await db.tx.findUnique({
          where: {
            id: input.txId,
          },
          include: txInclude,
        });
      }

      const originalTx = tx.originalBankTx;

      return await db.tx.update({
        where: {
          id: input.txId,
        },
        data: {
          name: originalTx.name,
          amount: originalTx.amount,
          datetime: originalTx.datetime,
          authorizedDatetime: originalTx.authorizedDatetime,
          accountId: originalTx.accountId,
          logoUrl: originalTx.logoUrl,
          isoCurrencyCode: originalTx.isoCurrencyCode,
          locationAddress: originalTx.locationAddress,
          locationCity: originalTx.locationCity,
          locationRegion: originalTx.locationRegion,
          locationPostalCode: originalTx.locationPostalCode,
          locationCountry: originalTx.locationCountry,
          catArray: {
            deleteMany: {},
            create: originalTx.catArray.map((cat) =>
              createCatWithoutTxInput(cat),
            ),
          },
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
