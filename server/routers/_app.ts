import { convertPlaidCatsToHierarchicalArray } from "@/util/cat";

import { procedure, router } from "../trpc";
import { client } from "../util/plaid";
import catRouter from "./cat";
import devRouter from "./dev";
import plaidRouter from "./plaid";
import receiptRouter from "./receipt";
import settingsRouter from "./settings";
import txRouter from "./tx";
import userRouter from "./user";

import { z } from "zod";

export const appRouter = router({
  user: userRouter,
  tx: txRouter,
  cat: catRouter,
  receipt: receiptRouter,
  dev: devRouter,
  settings: settingsRouter,
  plaid: plaidRouter,

  getCatOptionArray: procedure.input(z.undefined()).query(async () => {
    const response = await client.categoriesGet({});
    return convertPlaidCatsToHierarchicalArray(response.data.categories);
  }),
});

export type AppRouter = typeof appRouter;
