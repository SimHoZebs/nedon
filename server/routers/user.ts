import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserSecrets from "../../lib/util/stripUserSecrets";
import { PLAID_PRODUCTS } from "../util";

const userRouter = router({
  get: procedure.input(z.string()).query(async ({ input }) => {
    const user = await db.user.findFirst({
      where: {
        id: input,
      },
      include: {
        groupArray: true,
      },
    });

    if (!user) return null;

    return {
      products: PLAID_PRODUCTS,
      ...stripUserSecrets(user),
    };
  }),

  getAll: procedure.input(z.undefined()).query(async () => {
    const userArray = await db.user.findMany({
      include: {
        groupArray: true,
        friendArray: true,
      },
    });

    return userArray.map((user) => stripUserSecrets(user));
  }),

  create: procedure.input(z.undefined()).query(async () => {
    const user = await db.user.create({
      data: {},
      include: {
        groupArray: true,
      },
    });

    return stripUserSecrets(user);
  }),

  addFriend: procedure
    .input(
      z.object({ userId: z.string(), friendId: z.string().or(z.undefined()) })
    )
    .mutation(async ({ input }) => {
      const user = await db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          friendArray: {
            connectOrCreate: {
              where: {
                id: input.friendId,
              },
              create: {
                real: input.friendId ? true : false,
              },
            },
          },
        },
        include: {
          groupArray: true,
          friendArray: true,
        },
      });

      //adding user as a friend for the friend
      db.user.update({
        where: {
          id: input.friendId,
        },
        data: {
          friendArray: {
            connectOrCreate: {
              where: {
                id: input.userId,
              },
              create: {
                real: true,
              },
            },
          },
        },
      });

      return stripUserSecrets(user);
    }),
});
export default userRouter;
