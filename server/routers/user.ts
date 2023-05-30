import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserForClient from "../../lib/util/stripUserForClient";
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
      ...stripUserForClient(user),
    };
  }),

  getAll: procedure.input(z.undefined()).query(async () => {
    const userArray = await db.user.findMany({
      include: {
        groupArray: true,
      },
    });

    return userArray.map((user) => stripUserForClient(user));
  }),

  create: procedure.input(z.undefined()).query(async () => {
    const user = await db.user.create({
      data: {},
      include: {
        groupArray: true,
      },
    });

    return stripUserForClient(user);
  }),
});
export default userRouter;
