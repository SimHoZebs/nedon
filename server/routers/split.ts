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
      const split = await db.split.create({
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

  remove: procedure
    .input(
      z
        .object({ splitId: z.string() })
        .or(z.object({ userId: z.string(), transactionId: z.string() }))
    )
    .mutation(async ({ input }) => {
      //why do I have to await any of them? Don't they resolve asynchronously?
      if ("splitId" in input) {
        await db.split.delete({
          where: {
            id: input.splitId,
          },
        });
      } else {
        //delete doesn't work because the query is not unique - even though it techincally is.
        await db.split.deleteMany({
          where: {
            transactionId: input.transactionId,
            userId: input.userId,
          },
        });
      }
    }),
});

export default splitRouter;
