import { PureReceiptItemSchema } from "./receiptItem";

import type { Prisma } from "@prisma/client";
import { ReceiptItemSchema, ReceiptSchema } from "prisma/generated/zod";
import z from "zod";

export type BaseReceipt = Prisma.ReceiptGetPayload<{
  include: { items: true };
}>;

export const BaseReceiptSchema = ReceiptSchema.extend({
  items: ReceiptItemSchema.array(),
}) satisfies z.ZodType<BaseReceipt>;

export const UnsavedReceiptSchema = BaseReceiptSchema.omit({
  txId: true,
  id: true,
  items: true,
}).extend({
  id: z.string().optional(),
  items: z.array(PureReceiptItemSchema),
});

export type UnsavedReceipt = z.infer<typeof UnsavedReceiptSchema>;
