import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserSecrets from "../../lib/util/stripUserSecrets";
import { PLAID_PRODUCTS } from "../util";
import { Group, User } from "@prisma/client";
import { UserClientSide } from "../../lib/util/types";

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

  getAll: procedure
    .input(z.array(z.string()))
    .query(async ({ input: userIdArray }) => {
      let userArray: ((User & { groupArray: Group[] }) | null)[] = [];

      if (process.env.NODE_ENV === "production") {
        userArray =
          userIdArray.length > 0
            ? await db.$transaction(
                userIdArray.map((id) =>
                  db.user.findFirst({
                    where: { id },
                    include: { groupArray: true },
                  })
                )
              )
            : [];
      } else {
        //developers get to see all accounts
        userArray = await db.user.findMany({
          include: {
            groupArray: true,
          },
        });
      }

      const clientSideUserArray = userArray.map(
        (user) => user && stripUserSecrets(user)
      );

      return clientSideUserArray.filter((user) => !!user) as UserClientSide[];
    }),

  create: procedure.input(z.undefined()).mutation(async () => {
    const user = await db.user.create({
      data: {},
      include: {
        groupArray: true,
      },
    });

    return stripUserSecrets(user);
  }),

  delete: procedure.input(z.string()).mutation(async ({ input }) => {
    const user = await db.user.delete({
      where: {
        id: input,
      },
    });

    return user;
  }),
});
export default userRouter;
