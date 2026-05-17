import { router } from "../trpc";
import bankRouter from "./bank";
import blobStorageRouter from "./blobStorage";
import catRouter from "./cat";
import devRouter from "./dev";
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
  bank: bankRouter,
  blobStorage: blobStorageRouter,
});

export type AppRouter = typeof appRouter;
