import type { Prisma } from "@prisma/client";
import { ReceiptItemSchema } from "prisma/generated/zod";
import z from "zod";

export type BaseReceiptItem = Prisma.ReceiptItemGetPayload<undefined>;

export const BaseReceiptItemSchema =
  ReceiptItemSchema satisfies z.ZodType<BaseReceiptItem>;

//"Pure" types are types without considering the database schema.
export const PureReceiptItemSchema = BaseReceiptItemSchema.omit({
  receiptId: true,
  id: true,
}).extend({
  id: z.string().optional(),
  receiptId: z.string().optional(),
});

export type PureReceiptItem = z.infer<typeof PureReceiptItemSchema>;
