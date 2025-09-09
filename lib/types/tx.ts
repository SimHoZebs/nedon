import { isCatArrayInDB, UnsavedCatSchema } from "./cat";
import { plaidTxSchema } from "./plaid";
import { BaseReceiptSchema, UnsavedReceiptSchema } from "./receipt";

import type { Prisma } from "@prisma/client";
import { CatSchema, TxSchema } from "prisma/generated/zod";
import { z } from "zod";

export type SplitTx = Prisma.TxGetPayload<undefined>;

export const SplitTxSchema = TxSchema.omit({
  plaidTx: true,
})
  .extend({
    plaidTx: plaidTxSchema.nullable(),
  })
  .strict() satisfies z.ZodType<SplitTx>;

export const UnsavedSplitTxSchema = SplitTxSchema.omit({
  id: true,
}).strict();

export type UnsavedSplitTx = z.infer<typeof UnsavedSplitTxSchema>;

export type BaseTx = Prisma.TxGetPayload<{
  include: {
    splitTxArray: true;
    receipt: true;
    catArray: true;
  };
}>;

export const BaseTxSchema = TxSchema.extend({
  splitTxArray: z.array(SplitTxSchema),
  receipt: BaseReceiptSchema.nullable(),
  catArray: z.array(CatSchema),
  plaidTx: plaidTxSchema.nullable(),
}).strict() satisfies z.ZodType<BaseTx>;

//Although cat fields are created when a tx is created, new ones can exist without id on the clientside.
export const UnsavedTxSchema = BaseTxSchema.omit({
  id: true,
  catArray: true,
  receipt: true,
})
  .extend({
    catArray: z.array(UnsavedCatSchema),
    receipt: UnsavedReceiptSchema.nullable(),
  })
  .strict();

export type UnsavedTx = z.infer<typeof UnsavedTxSchema>;

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const SavedTxWithUnsavedContentSchema = BaseTxSchema.extend({
  catArray: z.array(z.union([UnsavedCatSchema, CatSchema])),
  receipt: UnsavedReceiptSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
}).strict();

export interface SavedTxWithUnsavedContent
  extends z.infer<typeof SavedTxWithUnsavedContentSchema> {}

export function isSavedTxWithUnsavedContent(
  tx: unknown,
): tx is SavedTxWithUnsavedContent {
  if (!tx || typeof tx !== "object" || !("id" in tx)) {
    return false;
  }
  return true;
}

export const SavedTxSchema = SavedTxWithUnsavedContentSchema.extend({
  catArray: z.array(CatSchema),
  receipt: BaseReceiptSchema.nullable(),
});

export interface SavedTx extends z.infer<typeof SavedTxSchema> {}

export type ClientSplit = SavedTx | UnsavedTx;

export function isSavedTx(tx: unknown): tx is SavedTx {
  if (!tx || typeof tx !== "object" || !("id" in tx) || !("catArray" in tx)) {
    return false;
  }
  return isCatArrayInDB(tx.catArray);
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
