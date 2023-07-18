import { Category } from "@prisma/client";
import { z } from "zod";
import db from "../../lib/util/db";
import { CategoryModel } from "../../prisma/zod";
import { procedure, router } from "../trpc";

const categoryRouter = router({
  upsertManyCategory: procedure
    .input(
      z.object({
        userId: z.string(),
        transactionId: z.string(),
        categoryArray: z.array(
          CategoryModel.extend({ id: z.string().nullish() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryArray.filter(
        (category) => category.id
      ) as Category[];
      const categoryToCreateArray = input.categoryArray.filter(
        (category) => !category.id
      ) as Omit<Category, "id">[];

      const upsertedTransaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          splitArray: {
            updateMany: categoryToUpdateArray.map(({ id, ...rest }) => ({
              where: {
                id,
              },
              data: {
                ...rest,
              },
            })),
            createMany: {
              data: categoryToCreateArray.map(({ ...category }) => ({
                userId: input.userId,
                ...category,
                id: undefined,
              })),
            },
          },
        },
        include: {
          splitArray: {
            include: {
              categoryArray: true,
            },
          },
        },
      });

      return upsertedTransaction;
    }),
});

export default categoryRouter;
