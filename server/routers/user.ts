import db from "@/util/db";

import { PLAID_PRODUCTS } from "../constants";
import { procedure, router } from "../trpc";

import { z } from "zod";

// Define the reusable selection pattern
const WITH_CONNECTIONS_OMIT_ACCESS_TOKEN = {
  include: {
    myConnectionArray: {
      omit: { accessToken: true },
    },
  },
  omit: { accessToken: true },
};

const userRouter = router({
  create: procedure
    .input(z.object({ name: z.string() }).optional())
    .mutation(async ({ input }) => {
      const user = await db.user.create({
        data: {
          name: input?.name || "",
        },
        ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
      });

      console.log("created user", user);

      return user;
    }),

  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findFirst({
        where: { id: input.id },
        ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
      });
      if (!user) return null;

      return {
        products: PLAID_PRODUCTS,
        ...user,
      };
    }),

  updateName: procedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
        ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
      });

      return user;
    }),

  delete: procedure.input(z.string()).mutation(async ({ input }) => {
    const user = await db.user.delete({
      where: {
        id: input,
      },
      ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
    });

    return user;
  }),

  addConnection: procedure
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

      return user;
    }),

  removeConnection: procedure
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

      return user;
    }),
});
export default userRouter;
