import type { Cat } from "@prisma/client";
import {
  CatOptionalDefaultsSchema,
  CatSchema,
  CatSettingsOptionalDefaultsSchema,
} from "prisma/generated/zod";
import { z } from "zod";

import db from "@/util/db";

import { procedure, router } from "../trpc";
import { CatClientSideSchema } from "@/util/types";

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
        catArray: z.array(CatClientSideSchema),
      }),
    )
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter((cat) => cat.id) as Cat[];
      const catToCreateArray = input.catArray.filter((cat) => !cat.id);

      const upsertedTx = await db.tx.update({
        where: { id: input.catArray[0].txId },
        data: {
          catArray: {
            updateMany: {
              where: { txId: input.catArray[0].txId },
              data: catToUpdateArray.map(({ id, txId, ...rest }) => rest),
            },

            createMany: {
              data: catToCreateArray.map(({ id, ...cat }) => ({
                ...cat,
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
        where: { id: input.id || "" },
        update: input,
        create: input,
      });

      return upsertedSettings;
    }),
});

export default catRouter;
