import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";
import stripUserForClient from "../../lib/util/stripUserForClient";

export const accountRouter = router({
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
