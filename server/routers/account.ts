import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";

export const accountRouter = router({
  getAll: procedure.input(z.undefined()).query(async () => {
    return db.user.findMany({
      include: {
        groupArray: true,
      },
    });
  }),

  create: procedure.input(z.undefined()).query(async () => {
    const user = await db.user.create({
      data: {},
    });

    return user;
  }),
});
