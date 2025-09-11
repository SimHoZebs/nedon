import { UnsavedReceiptSchema } from "@/types/receipt";

import { createReceipt, processReceipt } from "../domain/receipt";
import { procedure, router } from "../trpc";

import { z } from "zod";

const receiptRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string(),
        receipt: UnsavedReceiptSchema,
      }),
    )
    .mutation(async ({ input }) => {
      return await createReceipt(input);
    }),

  process: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      return await processReceipt(input.path);
    }),
});

export default receiptRouter;
