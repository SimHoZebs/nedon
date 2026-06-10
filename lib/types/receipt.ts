import { ReceiptItemFormStateSchema, ReceiptItemSchema } from "./receiptItem";

import { Prisma } from "@prisma/client";
import z from "zod";

type PureReceipt = Prisma.ReceiptGetPayload<undefined>;

const PureReceiptSchema = z
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
  .strict() satisfies z.ZodType<PureReceipt>;

export type Receipt = Prisma.ReceiptGetPayload<{
  include: { items: true };
}>;

export const ReceiptSchema = PureReceiptSchema.extend({
  items: ReceiptItemSchema.array(),
}) satisfies z.ZodType<Receipt>;

export const ReceiptFormStateSchema = z
  .object({
    id: z.string().optional(),
    is_receipt: z.boolean(),
    transaction_id: z.string(),
    date: z.coerce.date(),
    merchant: z.string(),
    subtotal: z.number(),
    currency: z.string(),
    tax: z.number(),
    tip: z.number(),
    grand_total: z.number(),
    payment_method: z.string(),
    online_link: z.string(),
    location: z.string(),
    txId: z.string().optional(),
    items: z.array(ReceiptItemFormStateSchema),
  })
  .strict();

export type ReceiptFormState = z.infer<typeof ReceiptFormStateSchema>;
