import { Group, User } from "@prisma/client";
import { z } from "zod";

import db from "@/util/db";
import { UserClientSide } from "@/util/types";
import { stripUserSecrets } from "@/util/user";

import { procedure, router } from "../trpc";
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
    let userArray: ((User & { groupArray: Group[]; }) | null)[] = [];

    //developers get to see all accounts
    userArray = await db.user.findMany({
      include: {
        groupArray: true,
      },
    });

    const clientSideUserArray = userArray.map(
      (user) => user && stripUserSecrets(user),
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

  deleteAll: procedure.input(z.undefined()).mutation(async () => {
    const user = await db.user.deleteMany({
    });

    return user.count;
  })
});
export default userRouter;
