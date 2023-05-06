import { router, procedure } from "../trpc";
import { z } from "zod";
import db from "../../lib/util/db";

export const groupRouter = router({
  create: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return db.group.create({
        data: {
          userArray: {
            connect: {
              id: input.id,
            },
          },
        },
        include: {
          userArray: true,
        },
      });
    }),
});
