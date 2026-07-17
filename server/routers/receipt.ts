import { ReceiptFormStateSchema, ReceiptSchema } from "@/types/receipt";

import { createReceipt, processReceipt } from "../services/receipt";
import { procedure, router } from "../trpc";

import { z } from "zod";

const receiptRouter = router({
  create: procedure
    .input(
      z.object({
        id: z.string(),
        receipt: ReceiptFormStateSchema,
      }),
    )
    .output(ReceiptSchema.nullable())
    .mutation(async ({ input }) => {
      return await createReceipt(input);
    }),

  process: procedure
    .input(z.object({ path: z.string() }))
    .output(
      z.object({
        success: z.boolean(),
        data: ReceiptFormStateSchema.optional(),
        clientMsg: z.string(),
        devMsg: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await processReceipt(input.path);
    }),
});

export default receiptRouter;
