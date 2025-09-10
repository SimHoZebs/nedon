import { PureReceiptItemSchema, ReceiptItemSchema } from "./receiptItem";

import { Prisma } from "@prisma/client";
import z from "zod";

export type BaseReceipt = Prisma.ReceiptGetPayload<{
  include: { items: true };
}>;

const ReceiptSchema = z
  .object({
    id: z.string(),
    is_receipt: z.boolean(),
    transaction_id: z.string(),
    date: z.date(),
    merchant: z.string(),
    subtotal: z.instanceof(Prisma.Decimal),
    currency: z.string(),
    tax: z.instanceof(Prisma.Decimal),
    tip: z.instanceof(Prisma.Decimal),
    grand_total: z.instanceof(Prisma.Decimal),
    payment_method: z.string(),
    online_link: z.string(),
    location: z.string(),
    txId: z.string(),
  })
  .strict();

export const BaseReceiptSchema = ReceiptSchema.extend({
  items: ReceiptItemSchema.array(),
}) satisfies z.ZodType<BaseReceipt>;

export const UnsavedReceiptSchema = BaseReceiptSchema.omit({
  txId: true,
  id: true,
  items: true,
})
  .extend({
    id: z.undefined(),
    txId: z.undefined(),
    items: z.array(PureReceiptItemSchema),
  })
  .strict();

export type UnsavedReceipt = z.infer<typeof UnsavedReceiptSchema>;
