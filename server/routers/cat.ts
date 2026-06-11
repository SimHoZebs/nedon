import { CatFormStateSchema, CatSchema } from "@/types/cat";

import { procedure, router } from "../trpc";

import { Prisma } from "@prisma/client";
import db from "server/util/db";
import { plaidCategories } from "server/util/plaidCategories";
import { z } from "zod";

const catRouter = router({
  create: procedure
    .input(CatFormStateSchema.extend({ txId: z.string() }))
    .mutation(async ({ input }) => {
      const { id: _id, amount, ...cat } = input;
      return await db.cat.create({
        data: {
          ...cat,
          amount: new Prisma.Decimal(amount),
        },
      });
    }),

  upsertMany: procedure
    .input(
      z.object({
        txId: z.string(),
        catArray: z.array(CatFormStateSchema),
      }),
    )
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

      return upsertedTx.catArray;
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await db.cat.delete({
        where: { id: input.id },
      });
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

  getPlaidCats: procedure.input(z.void()).query(async () => {
    return plaidCategories;
  }),
});

export default catRouter;
