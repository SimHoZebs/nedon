import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserSecrets from "../../lib/util/stripUserSecrets";
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
    const userArray = await db.user.findMany({
      include: {
        groupArray: true,
      },
    });

    return userArray.map((user) => stripUserSecrets(user));
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
