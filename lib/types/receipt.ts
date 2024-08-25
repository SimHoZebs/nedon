import {
  ReceiptItemOptionalDefaultsSchema,
  ReceiptOptionalDefaultsSchema,
} from "prisma/generated/zod";
import { z } from "zod";

export const ReceiptInputSchema = ReceiptOptionalDefaultsSchema.merge(
  z.object({
    items: z
      .lazy(() => ReceiptItemOptionalDefaultsSchema.omit({ receiptId: true }))
      .array(),
  }),
);

export const ReceiptSchema = z.object({
  is_receipt: z.boolean(),
  transaction_id: z.string(),
  date: z.string(),
  merchant: z.string(),
  currency: z.string(),
  tax: z.number(),
  tip: z.number(),
  total: z.number(),
  grand_total: z.number(),
  items: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      quantity: z.number(),
      unit_price: z.number(),
    }),
  ),
  payment_method: z.string(),
});

export type Receipt = z.infer<typeof ReceiptSchema>;
