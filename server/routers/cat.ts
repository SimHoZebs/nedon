import type { Cat } from "@prisma/client";
import {
  CatOptionalDefaultsSchema,
  CatSchema,
  CatSettingsOptionalDefaultsSchema,
  CatSettingsOptionalDefaultsWithRelationsSchema,
  CatSettingsWithRelationsSchema,
} from "prisma/generated/zod";
import { z } from "zod";

import db from "@/util/db";

import { procedure, router } from "../trpc";

const catRouter = router({
  create: procedure
    .input(CatOptionalDefaultsSchema)
    .mutation(async ({ input }) => {
      return await db.cat.create({
        data: input,
      });
    }),

  upsertMany: procedure
    .input(
      z.object({
        catArray: z.array(CatOptionalDefaultsSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter((cat) => cat.id) as Cat[];
      const catToCreateArray = input.catArray.filter((cat) => !cat.id);

      const upsertedSplit = await db.split.update({
        where: {
          id: input.catArray[0].splitId,
        },
        data: {
          catArray: {
            updateMany: catToUpdateArray.map(({ id, splitId, ...rest }) => ({
              where: { id },
              data: rest,
            })),

            createMany: {
              data: catToCreateArray.map(({ id, ...cat }) => ({
                ...cat,
                id: undefined,
              })),
            },
          },
        },
        include: {
          catArray: true,
        },
      });

      return upsertedSplit;
    }),

  deleteMany: procedure
    .input(
      z.object({
        catArray: z.array(CatSchema),
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
    .input(CatSettingsOptionalDefaultsSchema)
    .mutation(async ({ input }) => {
      const upsertedSettings = await db.catSettings.upsert({
        where: { id: input.id },
        update: input,
        create: input,
      });

      return upsertedSettings;
    }),
});

export default catRouter;
