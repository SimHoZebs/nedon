import { type Split, SplitOptionalDefaultsSchema } from "prisma/generated/zod";
import { z } from "zod";

import db from "@/util/db";

import { procedure, router } from "../trpc";

const splitRouter = router({
  create: procedure
    .input(
      z.object({
        txId: z.string(),
        split: SplitOptionalDefaultsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input.split;
      return await db.split.create({
        data: {
          ...rest,
          txId: input.txId,
        },
      });
    }),

  update: procedure
    .input(
      z.object({
        txId: z.string(),
        split: SplitOptionalDefaultsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...rest } = input.split;

      //TODO isn't this an upsert?
      const updatedTxArray = id
        ? await db.split.update({
            where: {
              id,
            },
            data: { ...rest },
          })
        : await db.split.create({
            data: { ...rest, txId: input.txId },
          });

      return updatedTxArray;
    }),

  upsertMany: procedure
    .input(z.array(SplitOptionalDefaultsSchema))
    .mutation(async ({ input }) => {
      const splitToUpdateArray = input.filter((split) => split.id) as Split[];
      const splitToCreateArray = input.filter((split) => !split.id);

      const updatedTx = await db.tx.update({
        where: {
          id: input[0].txId || undefined,
        },
        data: {
          splitArray: {
            createMany: {
              data: splitToCreateArray.map(({ id, txId, ...split }) => ({
                ...split,
              })),
            },

            update: splitToUpdateArray.map(({ id: splitId, ...split }) => ({
              where: { id: splitId },
              data: split,
            })),
          },
        },
        include: {
          splitArray: true,
        },
      });

      return updatedTx;
    }),

  delete: procedure
    .input(z.object({ splitId: z.string() }))
    .mutation(async ({ input }) => {
      //await so tx refetch occurs properly.
      await db.split.delete({
        where: {
          id: input.splitId,
        },
      });
    }),
});

export default splitRouter;
