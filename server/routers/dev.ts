import db from "@/util/db";
import { exact, type Result } from "@/util/type";

import type { unAuthUserClientSide } from "@/types/user";

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

  getFirstUser: procedure.input(z.undefined()).query(async () => {
    let result: Result<unAuthUserClientSide | null, unknown>;
    try {
      const user = await db.user.findFirst({
        include: {
          myConnectionArray: { omit: { accessToken: true } },
        },
      });

      if (!user) return null;

      const { accessToken, ...userWithoutAccessToken } = user;

      result = {
        ok: true,
        value: exact<unAuthUserClientSide>()({
          ...userWithoutAccessToken,
          hasAccessToken: !!accessToken,
        }),
      };
    } catch (e) {
      console.error("Error fetching first user:", e);
      result = {
        ok: false,
        error: e,
      };
    }

    return result;
  }),
});

export default devRouter;
