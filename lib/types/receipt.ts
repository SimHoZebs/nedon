import { MoneySchema } from "./money";
import { ReceiptItemFormStateSchema, ReceiptItemSchema } from "./receiptItem";

import z from "zod";

const PureReceiptSchema = z
  .object({
    id: z.string(),
    is_receipt: z.boolean(),
    transaction_id: z.string(),
    date: z.date(),
    merchant: z.string(),
    subtotal: MoneySchema,
    currency: z.string(),
    tax: MoneySchema,
    tip: MoneySchema,
    grand_total: MoneySchema,
    payment_method: z.string(),
    online_link: z.string(),
    location: z.string(),
    txId: z.string(),
  })
  .strict();

export const ReceiptSchema = PureReceiptSchema.extend({
  items: ReceiptItemSchema.array(),
}).strict();

export type Receipt = z.infer<typeof ReceiptSchema>;

export const ReceiptFormStateSchema = z
  .object({
    id: z.string().optional(),
    is_receipt: z.boolean(),
    transaction_id: z.string(),
    date: z.coerce.date(),
    merchant: z.string(),
    subtotal: MoneySchema,
    currency: z.string(),
    tax: MoneySchema,
    tip: MoneySchema,
    grand_total: MoneySchema,
    payment_method: z.string(),
    online_link: z.string(),
    location: z.string(),
    txId: z.string().optional(),
    items: z.array(ReceiptItemFormStateSchema),
  })
  .strict();

export type ReceiptFormState = z.infer<typeof ReceiptFormStateSchema>;
