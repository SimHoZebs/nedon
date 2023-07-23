import { Category } from "@prisma/client";
import { z } from "zod";
import db from "@/util/db";
import { CategoryModel } from "../../prisma/zod";
import { procedure, router } from "../trpc";
import { CategoryClientSideModel } from "@/util/types";

const categoryRouter = router({
  create: procedure
    .input(CategoryClientSideModel.extend({ splitId: z.string() }))
    .mutation(async ({ input }) => {
      const { id, ...rest } = input;
      await db.category.create({
        data: rest,
      });
    }),

  upsertMany: procedure
    .input(
      z.object({
        categoryArray: z.array(
          CategoryModel.extend({ id: z.string().nullable() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryArray.filter(
        (category) => category.id
      ) as Category[];
      const categoryToCreateArray = input.categoryArray.filter(
        (category) => !category.id
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
                data: { rest },
              })
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
});

export default categoryRouter;
