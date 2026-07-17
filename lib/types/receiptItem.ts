import { MdsTypeSchema } from "./enums";
import { MoneySchema } from "./money";

import z from "zod";

export const ReceiptItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    quantity: z.number(),
    unit_price: MoneySchema,
    mds: MdsTypeSchema,
    receiptId: z.string(),
  })
  .strict();

export type BaseReceiptItem = z.infer<typeof ReceiptItemSchema>;

export const BaseReceiptItemSchema = ReceiptItemSchema;

//"Pure" types are types without considering the database schema.
export const PureReceiptItemSchema = BaseReceiptItemSchema.omit({
  receiptId: true,
  id: true,
}).extend({
  id: z.string().optional(),
  receiptId: z.string().optional(),
});

export type PureReceiptItem = z.infer<typeof PureReceiptItemSchema>;

export const ReceiptItemFormStateSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    description: z.string(),
    quantity: z.number().int(),
    unit_price: MoneySchema,
    mds: MdsTypeSchema,
    receiptId: z.string().optional(),
  })
  .strict();

export type ReceiptItemFormState = z.infer<typeof ReceiptItemFormStateSchema>;
