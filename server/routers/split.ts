import { z } from "zod";
import db from "@/util/db";
import { SplitModel } from "../../prisma/zod";
import { procedure, router } from "../trpc";
import { SplitClientSideModel } from "@/util/types";

const splitRouter = router({
  create: procedure
    .input(
      z.object({
        split: SplitModel.extend({ id: z.string().nullable() }),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input.split;
      await db.split.create({
        data: rest,
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

  delete: procedure
    .input(z.object({ splitId: z.string() }))
    .mutation(async ({ input }) => {
      await db.category.deleteMany({
        where: {
          splitId: input.splitId,
        },
      });

      //await so transaction refetch occurs properly.
      await db.split.delete({
        where: {
          id: input.splitId,
        },
      });
    }),
});

export default splitRouter;
