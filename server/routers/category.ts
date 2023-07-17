import { CategoryTree } from "@prisma/client";
import { z } from "zod";
import db from "../../lib/util/db";
import { CategoryTreeModel } from "../../prisma/zod";
import { procedure, router } from "../trpc";

const categoryRouter = router({
  upsertManyCategory: procedure
    .input(
      z.object({
        transactionId: z.string(),
        categoryTreeArray: z.array(
          CategoryTreeModel.extend({ id: z.string().nullish() })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const categoryToUpdateArray = input.categoryTreeArray.filter(
        (category) => category.id
      ) as CategoryTree[];
      const categoryToCreateArray = input.categoryTreeArray.filter(
        (category) => !category.id
      ) as Omit<CategoryTree, "id">[];

      const upsertedTransaction = await db.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          splitArray: {
            updateMany: categoryToUpdateArray.map(
              ({ id, transactionId, ...rest }) => ({
                where: {
                  id,
                },
                data: {
                  ...rest,
                },
              })
            ),
            createMany: {
              data: categoryToCreateArray.map(
                ({ transactionId, ...category }) => ({
                  ...category,
                  id: undefined,
                })
              ),
            },
          },
        },
        include: {
          categoryTreeArray: {
            include: {
              splitArray: true,
            },
          },
        },
      });

      return upsertedTransaction;
    }),
});

export default categoryRouter;
