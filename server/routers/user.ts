import { exact, type Result } from "@/util/type";

import {
  isUserClientSide,
  type UserClientSide,
  type unAuthUserClientSide,
} from "@/types/user";

import { procedure, router } from "../trpc";

import { getPlaidTokensAndIds as getPlaidAccessData } from "server/services/plaidService";
import db from "server/util/db";
import { z } from "zod";

// Define the reusable selection pattern
const WITH_CONNECTIONS_OMIT_ACCESS_TOKEN = {
  include: {
    myConnectionArray: {
      omit: { accessToken: true },
    },
  },
};

const userRouter = router({
  create: procedure
    .input(z.object({ name: z.string(), id: z.cuid2().optional() }).optional())
    .mutation(async ({ input }) => {
      let result: Result<UserClientSide, unknown>;
      try {
        const userUpdateData = await getPlaidAccessData();
        if (!userUpdateData.ok) {
          throw new Error("Failed to get Plaid access data");
        }

        const user = await db.user.create({
          include: {
            myConnectionArray: {
              omit: {
                accessToken: true,
                publicToken: true,
                itemId: true,
                transferId: true,
              },
            },
          },
          data: {
            ...userUpdateData.value,
            id: input?.id,
          },
        });
        console.log("created user", user);

        if (!isUserClientSide(user)) {
          throw new Error("Created user does not match UserClientSide schema");
        }

        const { accessToken, ...userWithoutAccessToken } = user;

        result = {
          ok: true,
          value: exact<UserClientSide>()({
            ...userWithoutAccessToken,
            hasAccessToken: !!accessToken,
          }),
        };
      } catch (e) {
        console.error("Error creating user:", e);
        result = {
          ok: false,
          error: e,
        };
      }
      return result;
    }),

  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      let result: Result<unAuthUserClientSide | null, unknown>;
      try {
        const user = await db.user.findFirst({
          where: { id: input.id },
          ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
        });
        if (!user) throw new Error(`User with id ${input.id} not found`);

        result = {
          ok: true,
          value: {
            ...user,
            hasAccessToken: !!user.accessToken,
          },
        };
      } catch (e) {
        console.error("Error fetching user:", e);
        result = {
          ok: false,
          error: e,
        };
      }
      return result;
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
