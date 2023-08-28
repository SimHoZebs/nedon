import { Category } from "@prisma/client";
import { z } from "zod";
import db from "@/util/db";
import { CategoryModel } from "../../prisma/zod";
import { procedure, router } from "../trpc";
import { CategoryClientSideModel } from "@/util/types";

const categoryRouter = router({
  create: procedure
    .input(
      CategoryClientSideModel.extend({
        splitId: z.string(),
        id: z.undefined(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.category.create({
        data: input,
      });
    }),

  upsertMany: procedure
    .input(
      z.object({
        categoryArray: z.array(
          CategoryModel.extend({ id: z.string().nullable() }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryArray.filter(
        (category) => category.id,
      ) as Category[];
      const categoryToCreateArray = input.categoryArray.filter(
        (category) => !category.id,
      );

      const upsertedSplit = await db.split.update({
        where: {
          id: input.categoryArray[0].splitId,
        },
        data: {
          categoryArray: {
            updateMany: categoryToUpdateArray.map(
              ({ id, splitId, ...rest }) => ({
                where: { id },
                data: rest,
              }),
            ),

            createMany: {
              data: categoryToCreateArray.map(({ id, ...category }) => ({
                ...category,
                id: undefined,
              })),
            },
          },
        },
        include: {
          categoryArray: true,
        },
      });

      return upsertedSplit;
    }),

  deleteMany: procedure
    .input(
      z.object({
        categoryArray: z.array(CategoryModel),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedCategoryArray = await db.category.deleteMany({
        where: {
          OR: input.categoryArray.map(({ id }) => ({ id })),
        },
      });

      return deletedCategoryArray;
    }),
});

export default categoryRouter;
