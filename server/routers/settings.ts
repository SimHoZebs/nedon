import {
  CatSettingsSchema,
  UnsavedCatSettingsSchema,
} from "@/types/catSettings";
import { UserSettingsSchema } from "@/types/userSettings";

import { Prisma } from "@prisma/client";
import { mapCatSettings, mapUserSettings } from "server/mappers/prismaToDto";
import { procedure, router } from "server/trpc";
import db from "server/util/db";
import z from "zod";

const settingsRouter = router({
  get: procedure
    .input(z.object({ userId: z.string() }))
    .output(UserSettingsSchema.nullable())
    .query(async ({ input }) => {
      const settings = await db.userSettings.findFirst({
        where: { userId: input.userId },
        include: { catSettings: true },
      });
      return settings ? mapUserSettings(settings) : null;
    }),

  upsert: procedure
    .input(UserSettingsSchema)
    .output(UserSettingsSchema)
    .mutation(async ({ input }) => {
      const { id, catSettings, ...rest } = input;
      const catSettingsToCreate = catSettings.filter((cs) => !cs.id);
      const catSettingsToUpdate = catSettings;

      const settings = await db.userSettings.upsert({
        where: { id },
        create: {
          ...rest,
          catSettings: {
            create: catSettingsToCreate.map(({ id: _id, budget, ...cs }) => ({
              ...cs,
              budget: new Prisma.Decimal(budget),
            })),
          },
        },
        update: {
          ...rest,
          catSettings: {
            deleteMany: {
              id: { notIn: catSettingsToUpdate.map((cs) => cs.id) },
            },
            create: catSettingsToCreate.map(({ id: _id, budget, ...cs }) => ({
              ...cs,
              budget: new Prisma.Decimal(budget),
            })),
            update: catSettingsToUpdate.map(({ budget, ...cs }) => ({
              where: { id: cs.id },
              data: { ...cs, budget: new Prisma.Decimal(budget) },
            })),
          },
        },
        include: { catSettings: true },
      });
      return mapUserSettings(settings);
    }),

  upsertCatSetting: procedure
    .input(UnsavedCatSettingsSchema)
    .output(CatSettingsSchema)
    .mutation(async ({ input }) => {
      const { id, budget, userSettingsId, ...rest } = input;
      const catSettings = await db.catSettings.upsert({
        where: { id: id || "" },
        create: {
          ...rest,
          userSettingsId,
          budget: new Prisma.Decimal(budget),
        },
        update: { ...rest, budget: new Prisma.Decimal(budget) },
      });
      return mapCatSettings(catSettings);
    }),
});

export default settingsRouter;
