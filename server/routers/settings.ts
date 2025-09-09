import db from "@/util/db";

import { UnsavedCatSettingsSchema } from "@/types/catSettings";
import { BaseUserSettingsSchema } from "@/types/userSettings";

import { procedure, router } from "server/trpc";
import z from "zod";

const settingsRouter = router({
  get: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await db.userSettings.findFirst({
        where: { userId: input.userId },
        include: { catSettings: true },
      });
    }),

  upsert: procedure
    .input(BaseUserSettingsSchema)
    .mutation(async ({ input }) => {
      const { id, catSettings, ...rest } = input;
      const catSettingsToCreate = catSettings?.filter((cs) => !cs.id) || [];
      const catSettingsToUpdate = catSettings?.filter((cs) => cs.id) || [];

      return await db.userSettings.upsert({
        where: { id: id },
        create: {
          ...rest,
          catSettings: {
            create: catSettingsToCreate.map(({ id, ...cs }) => cs),
          },
        },
        update: {
          ...rest,
          catSettings: {
            deleteMany: {
              id: { notIn: catSettingsToUpdate.map((cs) => cs.id) },
            },
            create: catSettingsToCreate.map(({ id, ...cs }) => cs),
            update: catSettingsToUpdate.map((cs) => ({
              where: { id: cs.id },
              data: cs,
            })),
          },
        },
        include: { catSettings: true },
      });
    }),

  upsertCatSetting: procedure
    .input(UnsavedCatSettingsSchema)
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      return await db.catSettings.upsert({
        where: { id: id || "" },
        create: rest,
        update: rest,
      });
    }),
});

export default settingsRouter;
