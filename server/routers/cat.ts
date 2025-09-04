import db from "@/util/db";

import { type BaseCat, BaseCatSchema, UnsavedCat } from "@/types/cat";

import { procedure, router } from "../trpc";

import { z } from "zod";

const catRouter = router({
  create: procedure.input(UnsavedCat).mutation(async ({ input }) => {
    return await db.cat.create({
      data: input,
    });
  }),

  upsertMany: procedure
    .input(
      z.object({
        txId: z.string(),
        catArray: z.array(UnsavedCat),
      }),
    )
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter(
        (cat) => cat.id,
      ) as BaseCat[];
      const catToCreateArray = input.catArray.filter((cat) => !cat.id);

      const upsertedTx = await db.tx.update({
        where: { id: input.txId },
        data: {
          catArray: {
            updateMany:
              catToUpdateArray.length > 0
                ? catToUpdateArray.map(({ txId, ...rest }) => ({
                    where: { id: rest.id },
                    data: rest,
                  }))
                : undefined,

            createMany: {
              data: catToCreateArray.map(({ id, txId, ...rest }) => ({
                ...rest,
                id: undefined,
              })),
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
        catArray: BaseCatSchema.array(),
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
});

export default catRouter;
