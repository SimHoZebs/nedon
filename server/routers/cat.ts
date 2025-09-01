import { CatClientSideSchema } from "@/types/cat";
import db from "@/util/db";
import type { Cat } from "@prisma/client";
import {
  CatModelSchema,
  CatSettingsUncheckedCreateInputObjectSchema,
  CatSettingsUncheckedUpdateInputObjectSchema,
  CatUncheckedUpdateInputObjectSchema,
} from "prisma/generated/schemas";
import { z } from "zod";
import { procedure, router } from "../trpc";

const catRouter = router({
  create: procedure.input(CatClientSideSchema).mutation(async ({ input }) => {
    return await db.cat.create({
      data: input,
    });
  }),

  upsertMany: procedure
    .input(
      z.object({
        txId: z.string(),
        catArray: z.array(CatClientSideSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter((cat) => cat.id) as Cat[];
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
        catArray: z.array(CatModelSchema),
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

  getAllSettings: procedure.input(z.string()).query(async ({ input }) => {
    return await db.catSettings.findMany({
      where: { userId: input },
    });
  }),

  upsertSettings: procedure
    .input(
      z.union([
        CatSettingsUncheckedUpdateInputObjectSchema,
        CatSettingsUncheckedCreateInputObjectSchema,
      ]),
    )
    .mutation(async ({ input }) => {
      const upsertedSettings = await db.catSettings.upsert({
        where: { id: z.string().parse(input.id) },

        update: CatUncheckedUpdateInputObjectSchema.parse(input),
        create: CatSettingsUncheckedCreateInputObjectSchema.parse(input),
      });

      return upsertedSettings;
    }),
});

export default catRouter;
