import { UnsavedReceiptSchema } from "@/types/receipt";

import { createReceipt, processReceipt } from "../services/receiptService";
import { getSignedUploadUrl } from "../services/supabaseStorageService";
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

  getSignedUploadUrl: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      return await getSignedUploadUrl(input.path);
    }),

  process: procedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input }) => {
      return await processReceipt(input);
    }),
});

export default receiptRouter;
