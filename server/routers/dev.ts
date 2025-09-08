import db from "@/util/db";

import { exact } from "@/util/type";
import { type UserClientSide, UserClientSideSchema } from "@/types/user";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const devRouter = router({
  deleteAllUsers: procedure.input(z.undefined()).mutation(async () => {
    const user = await db.user.deleteMany({});

    return user.count;
  }),

  getAllUsers: procedure.input(z.undefined()).query(async () => {
    //developers get to see all accounts
    const userArray = await db.user.findMany({
      include: {
        myConnectionArray: { omit: { accessToken: true } },
      },
    });

    return userArray;
  }),

  getFirstUser: procedure
    .input(z.undefined())
    .output(UserClientSideSchema.nullable())
    .query(async () => {
      const user = await db.user.findFirst({
        include: {
          myConnectionArray: { omit: { accessToken: true } },
        },
      });

      if (!user) return null;

      const { accessToken, ...userWithoutAccessToken } = user;

      return exact<UserClientSide>()({
        ...userWithoutAccessToken,
        hasAccessToken: !!accessToken,
      });
    }),
});

export default devRouter;
