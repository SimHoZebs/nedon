import { CatSchema, isSavedCatArray, UnsavedCatSchema } from "./cat";
import { plaidTxSchema } from "./plaid";
import { ReceiptSchema, UnsavedReceiptSchema } from "./receipt";

import { MdsType, Prisma } from "@prisma/client";
import { z } from "zod";

export type SplitTx = Prisma.TxGetPayload<undefined>;

const SplitTx = z
  .object({
    id: z.string(),
    ownerId: z.string(),
    originTxId: z.string().nullable(),
    userTotal: z.instanceof(Prisma.Decimal),
    recurring: z.boolean(),
    mds: z.nativeEnum(MdsType),
    plaidId: z.string().nullable(),
    name: z.string(),
    amount: z.instanceof(Prisma.Decimal),
    datetime: z.date().nullable(),
    authorizedDatetime: z.date(),
    accountId: z.string().nullable(),
    plaidTx: plaidTxSchema.nullable(),
  })
  .strict() satisfies z.ZodType<SplitTx>;

export const UnsavedSplitTxSchema = SplitTx.omit({
  id: true,
})
  .extend({
    id: z.string().optional(),
  })
  .strict();

export type UnsavedSplitTx = z.infer<typeof UnsavedSplitTxSchema>;

export type Tx = Prisma.TxGetPayload<{
  include: {
    splitTxArray: true;
    receipt: { include: { items: true } };
    catArray: true;
  };
}>;

export const TxSchema = SplitTx.extend({
  splitTxArray: z.array(SplitTx),
  receipt: ReceiptSchema.nullable(),
  catArray: z.array(CatSchema),
  plaidTx: plaidTxSchema.nullable(),
}).strict() satisfies z.ZodType<Tx>;

//Although cat fields are created when a tx is created, new ones can exist without id on the clientside.
export const UnsavedTxSchema = TxSchema.omit({
  id: true,
  catArray: true,
  receipt: true,
})
  .extend({
    id: z.string().optional(),
    catArray: z.array(UnsavedCatSchema),
    receipt: UnsavedReceiptSchema.nullable(),
  })
  .strict();

export interface UnsavedTx extends z.infer<typeof UnsavedTxSchema> {}

export const isUnsavedTx = (tx: unknown): tx is UnsavedTx => {
  if (!tx || typeof tx !== "object" || "id" in tx) {
    return false;
  }
  return "catArray" in tx && Array.isArray(tx.catArray);
};

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const TxWithUnsavedContentSchema = TxSchema.extend({
  catArray: z.array(z.union([UnsavedCatSchema, CatSchema])),
  receipt: UnsavedReceiptSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
}).strict();

export interface TxWithUnsavedContent
  extends z.infer<typeof TxWithUnsavedContentSchema> {}

export function isTxWithUnsavedContent(
  tx: unknown,
): tx is TxWithUnsavedContent {
  if (!tx || typeof tx !== "object" || !("id" in tx)) {
    return false;
  }
  return true;
}

export function isTx(tx: unknown): tx is Tx {
  if (!tx || typeof tx !== "object" || !("id" in tx) || !("catArray" in tx)) {
    return false;
  }
  return isSavedCatArray(tx.catArray);
}

export const ChaseCSVTxSchema = z.object({
  Amount: z.string(),
  Balance: z.string(),
  CheckorSlip: z.string(),
  Description: z.string(),
  Details: z.string(),
  PostingDate: z.string(),
  Type: z.string(),
});

export type ChaseCSVTx = z.infer<typeof ChaseCSVTxSchema>;
