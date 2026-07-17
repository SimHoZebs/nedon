import type { Result } from "@/util/type";

import type { BankAccount } from "@/types/bank";
import {
  isUserClientSide,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

import { procedure, router } from "../trpc";
import connectionRouter from "./connection";

import { Prisma } from "@prisma/client";
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
        console.log("Created user without Bank data:", user);

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

  connectToBank: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      let result: Result<UserClientSide, Error>;
      try {
        const getResult = await ctx.bankService.establishConnection(input.id);
        if (!getResult.ok) {
          throw new Error(
            `Failed to establish bank connection: ${getResult.error}`,
          );
        }

        // Fetch user after update
        const user = await db.user.findUnique({
          where: { id: input.id },
          ...INCLUDE_CONNECTIONS_SAEFLY,
        });

        if (!user) {
          throw new UserNotFoundError(input.id);
        }

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
          console.error("Error connecting user to bank:", e);
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
    .query(async ({ input, ctx }) => {
      let result: Result<BankAccount[], Error>;

      try {
        const res = await ctx.bankService.getAccounts(input.userId);
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

  delete: procedure
    .input(z.string())
    .output(z.string())
    .mutation(async ({ input }) => {
      const user = await db.user.delete({
        where: {
          id: input,
        },
        select: { id: true },
      });

      return user.id;
    }),

  connection: connectionRouter,
});
export default userRouter;
