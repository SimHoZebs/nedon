import type { Result } from "@/util/type";

import {
  isUserClientSide,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

import { procedure, router } from "../trpc";
import connectionRouter from "./connection";

import { Prisma } from "@prisma/client";
import type { AccountBase, AuthGetResponse } from "plaid";
import {
  getAuth,
  getPlaidTokensAndIds as getPlaidAccessData,
} from "server/services/plaid";
import { UserNotFoundError } from "server/util/customErrors";
import db from "server/util/db";
import { INCLUDE_CONNECTIONS_SAEFLY, sanitizeUser } from "server/util/user";
import { z } from "zod";

const userRouter = router({
  create: procedure
    .input(
      z
        .object({ name: z.string().optional(), id: z.cuid2().optional() })
        .optional(),
    )
    .mutation(async ({ input }) => {
      let result: Result<UnAuthUserClientSide, unknown>;
      try {
        const user = await db.user.create({
          ...INCLUDE_CONNECTIONS_SAEFLY,
          data: {
            id: input?.id,
            name: input?.name,
          },
        });
        console.log("Created user without Plaid data:", user);

        result = {
          ok: true,
          value: sanitizeUser(user),
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
      let result: Result<UnAuthUserClientSide | UserClientSide, Error>;
      try {
        const user = await db.user.findFirst({
          where: { id: input.id },
          ...INCLUDE_CONNECTIONS_SAEFLY,
        });
        if (!user) {
          throw new UserNotFoundError(input.id);
        }

        result = {
          ok: true,
          value: sanitizeUser(user),
        };
      } catch (e) {
        if (e instanceof UserNotFoundError) {
          result = {
            ok: false,
            error: e,
          };
        } else {
          console.error("Error fetching user:", e);
          result = {
            ok: false,
            error: new Error("An unexpected error occurred."),
          };
        }
      }
      return result;
    }),

  connectToPlaid: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      let result: Result<UserClientSide, Error>;
      try {
        const plaidDataResult = await getPlaidAccessData();
        if (!plaidDataResult.ok) {
          throw new Error(
            `Failed to get Plaid access data: ${plaidDataResult.error}`,
          );
        }
        const user = await db.user.update({
          where: { id: input.id },
          data: {
            ...plaidDataResult.value,
          },
          ...INCLUDE_CONNECTIONS_SAEFLY,
        });

        const userClientSide = sanitizeUser(user);

        if (!isUserClientSide(userClientSide)) {
          throw new Error("Updated user does not match UserClientSide schema");
        }

        result = {
          ok: true,
          value: userClientSide,
        };
      } catch (e) {
        if (!(e instanceof Error)) {
          console.error("Unknown error type:", e);
          result = {
            ok: false,
            error: new Error("An unexpected error occurred."),
          };
          return result;
        }

        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          result = {
            ok: false,
            error: new UserNotFoundError(input.id),
          };
        } else {
          console.error("Error connecting user to Plaid:", e);
          result = {
            ok: false,
            error: new Error("An unexpected error occurred."),
          };
        }
      }
      return result;
    }),

  getAllAccounts: procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      let result: Result<AccountBase[], Error>;

      try {
        const user = await db.user.findFirst({
          where: {
            id: input.userId,
          },
          select: { accessToken: true },
        });

        if (!user || !user.accessToken)
          throw new Error("User or access token not found");

        const res = await getAuth(user.accessToken);

        result = { ok: true, value: res.accounts };
      } catch (e) {
        if (e instanceof Error) {
          result = { ok: false, error: e };
        } else {
          console.error("Error fetching accounts:", e);
          result = {
            ok: false,
            error: new Error("An unexpected error occurred."),
          };
        }
      }

      return result;
    }),

  updateName: procedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input }) => {
      let result: Result<UserClientSide, unknown>;

      try {
        const user = await db.user.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
          ...INCLUDE_CONNECTIONS_SAEFLY,
        });

        const clientSideUser = sanitizeUser(user);
        if (!isUserClientSide(clientSideUser)) {
          throw new Error("Updated user does not match UserClientSide schema");
        }
        result = {
          ok: true,
          value: clientSideUser,
        };
      } catch (e) {
        console.error("Error updating user name:", e);
        result = {
          ok: false,
          error: e,
        };
      }
      return result;
    }),

  delete: procedure.input(z.string()).mutation(async ({ input }) => {
    const user = await db.user.delete({
      where: {
        id: input,
      },
      ...INCLUDE_CONNECTIONS_SAEFLY,
    });

    return user;
  }),

  connection: connectionRouter,
});
export default userRouter;
