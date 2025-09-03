import {
  ReceiptItemCreateInputObjectSchema,
  type ReceiptItemModelType,
  ReceiptModelSchema,
} from "prisma/generated/schemas";
import { z } from "zod";

//"Pure" types are types without considering the database schema.
export const PureReceiptItemSchema = ReceiptModelSchema.omit({
  receiptId: true,
  id: true,
});

export type PureReceiptItem = z.infer<typeof PureReceiptItemSchema>;

export const PureReceiptWithChildrenSchema = ReceiptModelSchema.omit({
  txId: true,
  id: true,
}).extend({ items: z.array(PureReceiptItemSchema) });

export type PureReceiptWithChildren = z.infer<
  typeof PureReceiptWithChildrenSchema
>;

// Unlike "WithRelations", WithChildren" omits parent relations.
export const ReceiptOptionalDefaultsWithChildrenSchema =
  ReceiptModelSchema.extend({
    txId: z.string().optional(),
    items: z.array(ReceiptItemCreateInputObjectSchema),
  });

export type ReceiptOptionalDefaultsWithChildren = z.infer<
  typeof ReceiptOptionalDefaultsWithChildrenSchema
>;

export type ReceiptOptionalDefaultsRelations = {
  items: ReceiptItemModelType[];
};
