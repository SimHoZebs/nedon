import { Cat } from "@prisma/client";
import { z } from "zod";

import db from "@/util/db";
import { CatClientSideModel } from "@/util/types";

import { CatSchema, CatOptionalDefaultsSchema } from "prisma/generated/zod";
import { procedure, router } from "../trpc";

const catRouter = router({
  create: procedure
    .input(
      CatClientSideModel.extend({
        splitId: z.string(),
        id: z.undefined(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.cat.create({
        data: input,
      });
    }),

  upsertMany: procedure
    .input(
      z.object({
        catArray: z.array(
          CatOptionalDefaultsSchema
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const catToUpdateArray = input.catArray.filter(
        (cat) => cat.id,
      ) as Cat[];
      const catToCreateArray = input.catArray.filter(
        (cat) => !cat.id,
      );

      const upsertedSplit = await db.split.update({
        where: {
          id: input.catArray[0].splitId,
        },
        data: {
          catArray: {
            updateMany: catToUpdateArray.map(
              ({ id, splitId, ...rest }) => ({
                where: { id },
                data: rest,
              }),
            ),

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
});

export default catRouter;
