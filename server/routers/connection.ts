import { ClientUserSchema } from "@/types/user";

import { procedure, router } from "server/trpc";
import db from "server/util/db";
import { INCLUDE_CONNECTIONS_SAEFLY, sanitizeUser } from "server/util/user";
import z from "zod";

const connectionRouter = router({
  add: procedure
    .input(z.object({ userId: z.string(), connectionId: z.string() }))
    .output(ClientUserSchema)
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          myConnectionArray: {
            connect: {
              id: input.connectionId,
            },
          },
        },
        ...INCLUDE_CONNECTIONS_SAEFLY,
      });

      await db.user.update({
        where: {
          id: input.connectionId,
        },
        data: {
          myConnectionArray: {
            connect: {
              id: input.userId,
            },
          },
        },
      });

      return sanitizeUser(user);
    }),

  remove: procedure
    .input(z.object({ userId: z.string(), connectionId: z.string() }))
    .output(ClientUserSchema)
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          myConnectionArray: {
            disconnect: {
              id: input.connectionId,
            },
          },
        },
        ...INCLUDE_CONNECTIONS_SAEFLY,
      });

      await db.user.update({
        where: {
          id: input.connectionId,
        },
        data: {
          myConnectionArray: {
            disconnect: {
              id: input.userId,
            },
          },
        },
      });

      return sanitizeUser(user);
    }),
});
export default connectionRouter;
