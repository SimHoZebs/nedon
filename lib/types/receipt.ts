import { PureReceiptItemSchema } from "./receiptItem";

import type { Prisma, ReceiptItem } from "@prisma/client";
import { ReceiptItemSchema, ReceiptSchema } from "prisma/generated/zod";
import z from "zod";

export type BaseReceipt = Prisma.ReceiptGetPayload<{
  include: { items: true };
}>;

export const BaseReceiptSchema = ReceiptSchema.extend({
  items: ReceiptItemSchema.array(),
}) satisfies z.ZodType<BaseReceipt>;

export const PureReceiptWithChildrenSchema = BaseReceiptSchema.omit({
  txId: true,
  id: true,
}).extend({ items: z.array(PureReceiptItemSchema) });

export type PureReceiptWithChildren = z.infer<
  typeof PureReceiptWithChildrenSchema
>;

// Unlike "WithRelations", WithChildren" omits parent relations.
export const ReceiptWithChildrenSchema = BaseReceiptSchema.extend({
  txId: z.string().optional(),
  items: z.array(ReceiptItemSchema),
});

export type ReceiptOptionalDefaultsWithChildren = z.infer<
  typeof ReceiptWithChildrenSchema
>;

export type ReceiptOptionalDefaultsRelations = {
  items: ReceiptItem[];
};
