import db from "@/util/db";

import { procedure, router } from "server/trpc";
import { z } from "zod";

const devRouter = router({
  deleteAllUsers: procedure.input(z.undefined()).mutation(async () => {
    const user = await db.user.deleteMany({});

    return user.count;
  }),

  getAllUsers: procedure.input(z.undefined()).query(async () => {
    //developers get to see all accounts
    const userArray = await db.user.findMany({
      include: {
        myConnectionArray: true,
      },
    });

    return userArray;
  }),
});

export default devRouter;
