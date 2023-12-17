import { z } from "zod";

import db from "@/util/db";
import { SplitClientSideModel, SplitInDB } from "@/util/types";

import { procedure, router } from "../trpc";

const splitRouter = router({
  create: procedure
    .input(
      z.object({
        txId: z.string(),
        split: SplitClientSideModel,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, catArray, ...rest } = input.split;
      return await db.split.create({
        data: {
          ...rest,
          txId: input.txId,
          catArray: {
            createMany: {
              data: catArray.map((cat) => ({
                nameArray: cat.nameArray,
                amount: cat.amount,
              })),
            },
          },
        },
        include: {
          catArray: true,
        },
      });
    }),

  update: procedure
    .input(
      z.object({
        txId: z.string(),
        split: SplitClientSideModel,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, catArray, ...rest } = input.split;

      const updatedTxArray = id
        ? await db.split.update({
            where: {
              id,
            },
            data: {
              catArray: {
                updateMany: catArray.map((cat) => ({
                  where: {
                    splitId: id,
                  },
                  data: {
                    nameArray: cat.nameArray,
                    amount: cat.amount,
                  },
                })),
              },
            },
            include: {
              catArray: true,
            },
          })
        : await db.split.create({
            data: { ...rest, txId: input.txId },
            include: {
              catArray: true,
            },
          });

      return updatedTxArray;
    }),

  upsertMany: procedure
    .input(
      z.object({
        txId: z.string(),
        splitArray: z.array(SplitClientSideModel),
      }),
    )
    .mutation(async ({ input }) => {
      const splitToUpdateArray = input.splitArray.filter(
        (split) => split.id,
      ) as SplitInDB[];
      const splitToCreateArray = input.splitArray.filter((split) => !split.id);

      const updatedTx = await db.tx.update({
        where: {
          id: input.txId,
        },
        data: {
          splitArray: {
            create: splitToCreateArray.map(({ id, txId, ...split }) => ({
              ...split,
              catArray: {
                create: split.catArray.map(({ id, ...cat }) => ({
                  ...cat,
                })),
              },
            })),

            update: splitToUpdateArray.map(({ id: splitId, catArray }) => ({
              where: { id: splitId },
              data: {
                catArray: {
                  update: catArray.map(({ id, splitId, ...cat }) => ({
                    where: { id },
                    data: {
                      ...cat,
                    },
                  })),
                },
              },
            })),
          },
        },
        include: {
          splitArray: {
            include: {
              catArray: true,
            },
          },
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
