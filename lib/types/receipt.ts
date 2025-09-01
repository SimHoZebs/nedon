import { z } from "zod";
import {
  type ReceiptItem,
  ReceiptItemOptionalDefaultsSchema,
  ReceiptOptionalDefaultsSchema,
} from "../../prisma/generated/zod";

//"Pure" types are types without considering the database schema.
export const PureReceiptItemSchema = ReceiptItemOptionalDefaultsSchema.omit({
  receiptId: true,
  id: true,
});

export type PureReceiptItem = z.infer<typeof PureReceiptItemSchema>;

export const PureReceiptWithChildrenSchema = ReceiptOptionalDefaultsSchema.omit(
  {
    txId: true,
    id: true,
  },
).merge(z.object({ items: z.array(PureReceiptItemSchema) }));

export type PureReceiptWithChildren = z.infer<
  typeof PureReceiptWithChildrenSchema
>;

// Unlike "WithRelations", WithChildren" omits parent relations.
export const ReceiptOptionalDefaultsWithChildrenSchema =
  ReceiptOptionalDefaultsSchema.merge(
    z.object({
      txId: z.string().optional(),
      items: z.array(
        ReceiptItemOptionalDefaultsSchema.merge(
          z.object({ receiptId: z.string().optional() }),
        ),
      ),
    }),
  );

export type ReceiptOptionalDefaultsWithChildren = z.infer<
  typeof ReceiptOptionalDefaultsWithChildrenSchema
>;

export type ReceiptOptionalDefaultsRelations = {
  items: ReceiptItem[];
};
