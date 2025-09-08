import { BaseUserSchema } from "@/types/user";
import { BaseUserSettingsSchema } from "@/types/userSettings";
import db from "@/util/db";

import { procedure, router } from "server/trpc";
import z from "zod";

const settingsRouter = router({
  get: procedure.input(z.string()).query(async ({ input }) => {
    return await db.userSettings.findMany({
      where: { userId: input },
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
          catSettings: { createMany: { data: catSettingsToCreate } },
        },
        update: {
          ...rest,
          catSettings: { updateMany: { data: catSettingsToUpdate } },
        },
        include: { catSettings: true },
      });
    }),
});

export default settingsRouter;
