import { UnsavedCatSettingsSchema } from "@/types/catSettings";
import { UserSettingsSchema } from "@/types/userSettings";

import { client } from "../util/plaid";

import { convertPlaidCatsToHierarchicalArray } from "lib/domain/cat";
import { procedure, router } from "server/trpc";
import db from "server/util/db";
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

  getCatOptionArray: procedure.input(z.undefined()).query(async () => {
    const response = await client.categoriesGet({});
    return convertPlaidCatsToHierarchicalArray(response.data.categories);
  }),
  upsert: procedure.input(UserSettingsSchema).mutation(async ({ input }) => {
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
