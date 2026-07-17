import type { Result } from "@/util/type";

import { type Tx, TxFormStateSchema, TxSchema } from "@/types/tx";

import { procedure, router } from "../trpc";

import { Prisma, TxKind } from "@prisma/client";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { createCatWithoutTxInput } from "server/domains/cat";
import { createTxInput, txInclude } from "server/domains/tx";
import { mapTx, prismaDecimalToMoney } from "server/mappers/prismaToDto";
import db from "server/util/db";
import { z } from "zod";

const txRouter = router({
  getWithoutBank: procedure
    .input(z.object({ userId: z.string(), txId: z.string() }))
    .output(TxSchema.nullable())
    .query(async ({ input }) => {
      const txInDB = await db.tx.findFirst({
        where: {
          id: input.txId,
          ownerId: input.userId,
        },
        include: txInclude,
      });

      if (!txInDB) return null;

      return mapTx(txInDB);
    }),

  getAll: procedure
    .input(z.object({ userId: z.string(), date: z.date() }))
    .output(
      z.discriminatedUnion("ok", [
        z.object({ ok: z.literal(true), value: TxSchema.array() }),
        z.object({ ok: z.literal(false), error: z.unknown() }),
      ]),
    )
    .query(async ({ input }) => {
      let result: Result<Tx[], unknown>;
      try {
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
            splitTxArray: true,
          },
        });

        console.log("returning txArray", txArray.length);
        result = { ok: true, value: txArray.map(mapTx) };
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
    .output(TxSchema.array())
    .query(async ({ input }) => {
      const txArray = await db.tx.findMany({
        where: {
          ownerId: input.id,
          kind: { not: TxKind.ORIGINAL },
        },

        include: txInclude,
      });
      return txArray.map(mapTx);
    }),

  create: procedure
    .input(TxFormStateSchema)
    .output(TxSchema)
    .mutation(async ({ input }) => {
      const tx = await db.tx.create({
        data: createTxInput(input),
        include: txInclude,
      });
      return mapTx(tx);
    }),

  createMany: procedure
    .input(z.array(TxFormStateSchema))
    .output(TxSchema.array())
    .mutation(async ({ input }) => {
      const txCreateQueryArray = input.map((tx) => {
        return db.tx.create({ data: createTxInput(tx), include: txInclude });
      });

      const txArray = await db.$transaction(txCreateQueryArray);
      return txArray.map(mapTx);
    }),

  update: procedure
    .input(TxFormStateSchema.extend({ id: z.string() }))
    .output(TxSchema)
    .mutation(async ({ input }) => {
      const {
        id,
        catArray,
        splitTxArray: _splitTxArray,
        receipt: _receipt,
        originalBankTxId: _originalBankTxId,
        originTxId: _originTxId,
        kind: _kind,
        ownerId: _ownerId,
        amount,
        userTotal,
        recurring,
        mds,
        name,
        datetime,
        authorizedDatetime,
        accountId,
        logoUrl,
        isoCurrencyCode,
        locationAddress,
        locationCity,
        locationRegion,
        locationPostalCode,
        locationCountry,
      } = input;
      const catToCreate = catArray.filter((cat) => !cat.id);
      const catToUpdate = catArray.filter((cat) => cat.id);

      const tx = await db.tx.update({
        where: {
          id,
        },
        data: {
          recurring,
          mds,
          name,
          amount: new Prisma.Decimal(amount),
          userTotal: new Prisma.Decimal(userTotal),
          datetime,
          authorizedDatetime,
          financialAccountId: accountId,
          logoUrl,
          isoCurrencyCode,
          locationAddress,
          locationCity,
          locationRegion,
          locationPostalCode,
          locationCountry,
          catArray: {
            createMany: {
              data: catToCreate.map(
                ({ id: _id, txId: _txId, amount, ...cat }) => ({
                  ...cat,
                  amount: new Prisma.Decimal(amount),
                }),
              ),
            },
            updateMany: catToUpdate.map(
              ({ id, txId: _txId, ...catWithoutId }) => ({
                where: { id: id },
                data: {
                  ...catWithoutId,
                  amount: new Prisma.Decimal(catWithoutId.amount),
                },
              }),
            ),
          },
        },
        include: txInclude,
      });

      return mapTx(tx);
    }),

  reset: procedure
    .input(z.object({ txId: z.string() }))
    .output(TxSchema.nullable())
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
        const unchangedTx = await db.tx.findUnique({
          where: {
            id: input.txId,
          },
          include: txInclude,
        });
        return unchangedTx ? mapTx(unchangedTx) : null;
      }

      const originalTx = tx.originalBankTx;

      const resetTx = await db.tx.update({
        where: {
          id: input.txId,
        },
        data: {
          name: originalTx.name,
          amount: originalTx.amount,
          datetime: originalTx.datetime,
          authorizedDatetime: originalTx.authorizedDatetime,
          financialAccountId: originalTx.financialAccountId,
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
              createCatWithoutTxInput({
                ...cat,
                amount: prismaDecimalToMoney(cat.amount),
              }),
            ),
          },
        },
        include: txInclude,
      });
      return mapTx(resetTx);
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
