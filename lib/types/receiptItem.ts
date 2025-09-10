import { MdsType, Prisma } from "@prisma/client";
import z from "zod";

export const ReceiptItemSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    quantity: z.number(),
    unit_price: z.instanceof(Prisma.Decimal),
    mds: z.nativeEnum(MdsType),
    receiptId: z.string(),
  })
  .strict();

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
