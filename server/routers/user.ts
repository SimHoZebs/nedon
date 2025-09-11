import { exact, type Result } from "@/util/type";

import {
  isUserClientSide,
  type UnAuthUserClientSide,
  type UserClientSide,
} from "@/types/user";

import { procedure, router } from "../trpc";
import connectionRouter from "./connection";

import { Prisma } from "@prisma/client";
import { getPlaidTokensAndIds as getPlaidAccessData } from "server/services/plaidService";
import { UserNotFoundError } from "server/util/customErrors";
import db from "server/util/db";
import { z } from "zod";

// Define the reusable selection pattern
const WITH_CONNECTIONS_OMIT_ACCESS_TOKEN = {
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
};

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
          ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
          data: {
            id: input?.id,
            name: input?.name,
          },
        });
        console.log("Created user without Plaid data:", user);

        const { accessToken, ...userWithoutAccessToken } = user;

        const userClientSide: UnAuthUserClientSide = {
          ...userWithoutAccessToken,
          hasAccessToken: !!accessToken,
        };

        result = {
          ok: true,
          value: userClientSide,
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
          ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
        });
        if (!user) {
          throw new UserNotFoundError(input.id);
        }

        result = {
          ok: true,
          value: {
            ...user,
            hasAccessToken: !!user.accessToken,
          },
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
      let result: Result<
        UserClientSide,
        { code: string; message: string } | Error
      >;
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
          ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
        });
        const { accessToken, ...userWithoutAccessToken } = user;
        const userClientSide = {
          ...userWithoutAccessToken,
          hasAccessToken: !!accessToken,
        };

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
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred.",
            },
          };
          return result;
        }

        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2025"
        ) {
          const err = new UserNotFoundError(input.id);
          result = {
            ok: false,
            error: { code: err.code, message: err.message },
          };
        } else {
          console.error("Error connecting user to Plaid:", e);
          result = {
            ok: false,
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred.",
            },
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
          ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
        });

        if (!isUserClientSide(user)) {
          throw new Error("Updated user does not match UserClientSide schema");
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
      ...WITH_CONNECTIONS_OMIT_ACCESS_TOKEN,
    });

    return user;
  }),

  connection: connectionRouter,
});
export default userRouter;
