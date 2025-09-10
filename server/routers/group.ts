import { procedure, router } from "../trpc";

import db from "server/util/db";
import { z } from "zod";

export const groupRouter = router({
  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const group = await db.group.findUnique({
        where: {
          id: input.id,
        },
        include: {
          userArray: {
            omit: { accessToken: true },
          },
        },
      });

      if (!group) return null;
      return group;
    }),

  create: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const group = await db.group.create({
        data: {
          groupOwner: {
            connect: {
              id: input.id,
            },
          },
          userArray: {
            connect: {
              id: input.id,
            },
          },
        },
        include: {
          userArray: { omit: { accessToken: true } },
        },
      });

      return group;
    }),

  delete: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const group = await db.group.delete({
        where: {
          id: input.id,
        },
      });

      return !!group;
    }),

  addUser: procedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const group = await db.group.update({
        where: {
          id: input.groupId,
        },
        data: {
          userArray: {
            connect: {
              id: input.userId,
            },
          },
        },
        include: {
          userArray: { omit: { accessToken: true } },
        },
      });

      return group;
    }),

  removeUser: procedure
    .input(z.object({ groupId: z.string(), userId: z.string() }))
    .mutation(async ({ input }) => {
      const group = await db.group.update({
        where: {
          id: input.groupId,
        },
        data: {
          userArray: {
            disconnect: {
              id: input.userId,
            },
          },
        },
        include: {
          userArray: { omit: { accessToken: true } },
        },
      });

      return group;
    }),
});
