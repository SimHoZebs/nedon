import type { Result } from "@/util/type";

import {
  isUserClientSide,
  PublicUserSchema,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

import { procedure, router } from "server/trpc";
import { UserNotFoundError } from "server/util/customErrors";
import db from "server/util/db";
import { INCLUDE_CONNECTIONS_SAEFLY, sanitizeUser } from "server/util/user";
import { z } from "zod";

const devRouter = router({
  deleteAllUsers: procedure.input(z.undefined()).mutation(async () => {
    const user = await db.user.deleteMany({});

    return user.count;
  }),

  getAllUsers: procedure
    .input(z.undefined())
    .output(z.array(PublicUserSchema))
    .query(async () => {
      return db.user.findMany({
        select: { id: true, name: true },
      });
    }),

  getFirstUser: procedure.input(z.undefined()).query(async () => {
    let result: Result<UnAuthUserClientSide | UserClientSide, unknown>;
    try {
      const user = await db.user.findFirst({
        ...INCLUDE_CONNECTIONS_SAEFLY,
      });

      if (!user) throw UserNotFoundError;

      const userClientSide = sanitizeUser(user);

      if (isUserClientSide(userClientSide)) {
        result = {
          ok: true,
          value: userClientSide,
        };
      } else {
        result = {
          ok: true,
          value: userClientSide,
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
