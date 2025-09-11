import { exact, type Result } from "@/util/type";

import {
  isUserClientSide,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

import { procedure, router } from "server/trpc";
import db from "server/util/db";
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
    let result: Result<UnAuthUserClientSide | UserClientSide, unknown>;
    try {
      const user = await db.user.findFirst({
        include: {
          myConnectionArray: { omit: { accessToken: true } },
        },
      });

      if (!user) throw new Error("No users found in the database.");

      const { accessToken, ...userWithoutAccessToken } = user;
      const userClientSide = {
        ...userWithoutAccessToken,
        hasAccessToken: !!accessToken,
      };

      if (isUserClientSide(userClientSide)) {
        result = {
          ok: true,
          value: exact<UserClientSide>()(userClientSide),
        };
      } else {
        result = {
          ok: true,
          value: exact<UnAuthUserClientSide>()(userClientSide),
        };
      }
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
