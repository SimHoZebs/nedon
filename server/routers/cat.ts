import { CatFormStateSchema, CatSchema } from "@/types/cat";

import { procedure, router } from "../trpc";

import { Prisma } from "@prisma/client";
import { transactionCategories } from "lib/domain/transactionCategories";
import { mapCat } from "server/mappers/prismaToDto";
import db from "server/util/db";
import { z } from "zod";

const catRouter = router({
  create: procedure
    .input(CatFormStateSchema.extend({ txId: z.string() }))
    .output(CatSchema)
    .mutation(async ({ input }) => {
      const { id: _id, amount, ...cat } = input;
      const createdCat = await db.cat.create({
        data: {
          ...cat,
          amount: new Prisma.Decimal(amount),
        },
      });
      return mapCat(createdCat);
    }),

  upsertMany: procedure
    .input(
      z.object({
        txId: z.string(),
        catArray: z.array(CatFormStateSchema),
      }),
    )
    .output(CatSchema.array())
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter(
        (cat): cat is (typeof input.catArray)[number] & { id: string } =>
          !!cat.id,
      );
      const catToCreateArray = input.catArray.filter((cat) => !cat.id);

      const upsertedTx = await db.tx.update({
        where: { id: input.txId },
        data: {
          catArray: {
            updateMany:
              catToUpdateArray.length > 0
                ? catToUpdateArray.map(({ id, txId, amount, ...rest }) => ({
                    where: { id },
                    data: {
                      ...rest,
                      amount: new Prisma.Decimal(amount),
                    },
                  }))
                : undefined,

            createMany: {
              data: catToCreateArray.map(
                ({ id: _id, txId, amount, ...rest }) => ({
                  ...rest,
                  amount: new Prisma.Decimal(amount),
                }),
              ),
            },
          },
        },
        include: { catArray: true },
      });

      return upsertedTx.catArray.map(mapCat);
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .output(CatSchema)
    .mutation(async ({ input }) => {
      const deletedCat = await db.cat.delete({
        where: { id: input.id },
      });
      return mapCat(deletedCat);
    }),

  deleteMany: procedure
    .input(
      z.object({
        catArray: CatSchema.array(),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedCatArray = await db.cat.deleteMany({
        where: {
          OR: input.catArray.map(({ id }) => ({ id })),
        },
      });

      return deletedCatArray;
    }),

  getCategoryCatalog: procedure.input(z.void()).query(async () => {
    return transactionCategories;
  }),
});

export default catRouter;
