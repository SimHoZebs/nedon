import { Category } from "@prisma/client";
import { z } from "zod";
import db from "@/util/db";
import { procedure, router } from "../trpc";
import { CategoryInSplitInDB, categoryInSplitInDB } from "@/util/types";
import { CategoryModel } from "prisma/zod";

const categoryRouter = router({
  create: procedure.input(categoryInSplitInDB).mutation(async ({ input }) => {
    const { id, ...rest } = input;
    await db.category.create({
      data: rest,
    });
  }),

  upsertMany: procedure
    .input(
      z.object({
        categoryArray: z.array(categoryInSplitInDB),
      })
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryArray.filter(
        (category) => category.id
      ) as Category[];
      const categoryToCreateArray = input.categoryArray.filter(
        (category) => !category.id
      ) as CategoryInSplitInDB[];

      const upsertedSplitArray = await db.split.update({
        where: {
          id: input.categoryArray[0].splitId,
        },
        data: {
          categoryArray: {
            updateMany: categoryToUpdateArray.map(
              ({ id, splitId, ...rest }) => ({
                where: { id },
                data: { rest },
              })
            ),
            createMany: {
              data: categoryToCreateArray.map(({ id, ...category }) => ({
                ...category,
              })),
            },
          },
        },
        include: {
          categoryArray: true,
        },
      });

      return upsertedSplitArray;
    }),
});

export default categoryRouter;
