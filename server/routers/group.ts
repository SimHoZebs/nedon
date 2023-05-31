import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserSecretsFromGroup from "../../lib/util/stripUserSecretsFromGroup";

export const groupRouter = router({
  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const group = await db.group.findUnique({
        where: {
          id: input.id,
        },
        include: {
          userArray: true,
        },
      });

      if (!group) return null;
      return stripUserSecretsFromGroup(group);
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
          userArray: true,
        },
      });

      return stripUserSecretsFromGroup(group);
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
          userArray: true,
        },
      });

      return stripUserSecretsFromGroup(group);
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
          userArray: true,
        },
      });

      return stripUserSecretsFromGroup(group);
    }),
});
