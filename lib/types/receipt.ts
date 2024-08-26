import {
  type ReceiptItem,
  ReceiptItemOptionalDefaultsSchema,
  ReceiptOptionalDefaultsSchema,
} from "prisma/generated/zod";
import { z } from "zod";

export const ReceiptSchema = ReceiptOptionalDefaultsSchema.omit({
  txId: true,
}).merge(
  z.object({
    items: z.array(ReceiptItemOptionalDefaultsSchema),
  }),
);

export type Receipt = z.infer<typeof ReceiptSchema>;

export type ReceiptOptionalDefaultsRelations = {
  items: ReceiptItem[];
};

export type ReceiptOptionalDefaultsWithRelations = z.infer<
  typeof ReceiptSchema
> &
  ReceiptOptionalDefaultsRelations;
