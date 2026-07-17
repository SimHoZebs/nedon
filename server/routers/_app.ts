import { router } from "../trpc";
import blobStorageRouter from "./blobStorage";
import catRouter from "./cat";
import devRouter from "./dev";
import financialRouter from "./financial";
import receiptRouter from "./receipt";
import settingsRouter from "./settings";
import txRouter from "./tx";
import userRouter from "./user";

export const appRouter = router({
  user: userRouter,
  tx: txRouter,
  cat: catRouter,
  receipt: receiptRouter,
  dev: devRouter,
  settings: settingsRouter,
  financial: financialRouter,
  blobStorage: blobStorageRouter,
});

export type AppRouter = typeof appRouter;
