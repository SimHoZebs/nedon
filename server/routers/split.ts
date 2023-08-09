import { z } from "zod";
import db from "@/util/db";
import { procedure, router } from "../trpc";
import { SplitClientSideModel, SplitInDB } from "@/util/types";

const splitRouter = router({
  create: procedure
    .input(
      z.object({
        split: SplitClientSideModel,
      })
    )
    .mutation(async ({ input }) => {
      const { id, categoryArray, ...rest } = input.split;
      return await db.split.create({
        data: {
          ...rest,
          categoryArray: {
            createMany: {
              data: categoryArray.map((category) => ({
                amount: category.amount,
              })),
            },
          },
        },
        include: {
          categoryArray: true,
        },
      });
    }),

  update: procedure
    .input(
      z.object({
        split: SplitClientSideModel,
      })
    )
    .mutation(async ({ input }) => {
      const { id, categoryArray, ...rest } = input.split;
      const { id: categoryID, ...categoryRest } = categoryArray[0];

      const updatedTransactionArray = id
        ? await db.split.update({
            where: {
              id,
            },
            data: {
              categoryArray: {
                updateMany: categoryArray.map((category) => ({
                  where: {
                    splitId: id,
                  },
                  data: {
                    nameArray: category.nameArray,
                    amount: category.amount,
                  },
                })),
              },
            },
            include: {
              categoryArray: true,
            },
          })
        : await db.split.create({
            data: rest,
            include: {
              categoryArray: true,
            },
          });

      return updatedTransactionArray;
    }),

  upsertMany: procedure
    .input(
      z.object({
        splitArray: z.array(SplitClientSideModel),
      })
    )
    .mutation(async ({ input }) => {
      const splitToUpdateArray = input.splitArray.filter(
        (split) => split.id
      ) as SplitInDB[];
      const splitToCreateArray = input.splitArray.filter((split) => !split.id);

      const updatedTransaction = await db.transaction.update({
        where: {
          id: input.splitArray[0].transactionId,
        },
        data: {
          splitArray: {
            create: splitToCreateArray.map(
              ({ id, transactionId, ...split }) => ({
                ...split,
                categoryArray: {
                  create: split.categoryArray.map(({ id, ...category }) => ({
                    ...category,
                  })),
                },
              })
            ),

            update: splitToUpdateArray.map(
              ({ id: splitId, categoryArray }) => ({
                where: { id: splitId },
                data: {
                  categoryArray: {
                    update: categoryArray.map(
                      ({ id, splitId, ...category }) => ({
                        where: { id },
                        data: {
                          ...category,
                        },
                      })
                    ),
                  },
                },
              })
            ),
          },
        },
      });

      return updatedTransaction;
    }),

  delete: procedure
    .input(z.object({ splitId: z.string() }))
    .mutation(async ({ input }) => {
      //await so transaction refetch occurs properly.
      await db.split.delete({
        where: {
          id: input.splitId,
        },
      });
    }),
});

export default splitRouter;
