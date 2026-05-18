import { OMIT_PRIVATE_DATA } from "@/types/user";

import { procedure, router } from "server/trpc";
import db from "server/util/db";
import z from "zod";

const WITH_CONNECTIONS_OMIT_ACCESS_TOKEN = {
  include: {
    myConnectionArray: {
      omit: OMIT_PRIVATE_DATA,
    },
  },
};

const connectionRouter = router({
  add: procedure
    .input(z.object({ userId: z.string(), connectionId: z.string() }))
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
        ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
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

      return user as any;
    }),

  remove: procedure
    .input(z.object({ userId: z.string(), connectionId: z.string() }))
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
        ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
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

      return user as any;
    }),
});
export default connectionRouter;
