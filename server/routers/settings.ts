import db from "@/util/db";

import { procedure, router } from "server/trpc";
import z from "zod";

const settingsRouter = router({
  getSettings: procedure.input(z.string()).query(async ({ input }) => {
    return await db.userSettings.findMany({
      where: { userId: input },
      include: { catSettings: true },
    });
  }),
});

export default settingsRouter;
