import { UnsavedCat } from "./cat";
import { plaidTxSchema } from "./plaid";
import { BaseReceiptSchema, UnsavedReceiptSchema } from "./receipt";

import type { Prisma } from "@prisma/client";
import { CatSchema, TxSchema } from "prisma/generated/zod";
import { z } from "zod";

type BaseTxWithoutSplitTxArray = Prisma.TxGetPayload<{
  include: {
    catArray: true;
    receipt: { include: { items: true } };
  };
}>;

const BaseTxSchemaWithoutSplitTxArray = TxSchema.omit({ plaidTx: true })
  .extend({
    plaidTx: plaidTxSchema.nullable(),
    catArray: CatSchema.array(),
    receipt: BaseReceiptSchema.nullable(),
  })
  .strict() satisfies z.ZodType<BaseTxWithoutSplitTxArray>;

const BaseTxSchema = BaseTxSchemaWithoutSplitTxArray.extend({
  splitTxArray: BaseTxSchemaWithoutSplitTxArray.array(),
}).strict();

// ------------------------- End of BaseTx ------------------------- //

//Although cat fields are created when a tx is created, new ones can exist without id on the clientside.
export const UnsavedTxSchema = BaseTxSchema.omit({
  id: true,
  catArray: true,
  receipt: true,
})
  .extend({
    id: z.undefined(),
    catArray: z.array(UnsavedCat),
    receipt: UnsavedReceiptSchema.nullable(),
  })
  .strict();

export type UnsavedTx = z.infer<typeof UnsavedTxSchema>;

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const SavedTxWithUnsavedContentSchema = BaseTxSchema.extend({
  catArray: z.array(z.union([UnsavedCat, CatSchema])),
  receipt: UnsavedReceiptSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
}).strict();

export interface SavedTxWithUnsavedContent
  extends z.infer<typeof SavedTxWithUnsavedContentSchema> {}

export function isSavedTxWithUnsavedContent(
  tx: unknown,
): tx is SavedTxWithUnsavedContent {
  return (tx as UnsavedTx).id !== undefined;
}

export const SavedTxSchema = SavedTxWithUnsavedContentSchema.extend({
  catArray: z.array(CatSchema),
  receipt: BaseReceiptSchema.nullable(),
});

export interface SavedTx extends z.infer<typeof SavedTxSchema> {}

export function isSavedTx(tx: unknown): tx is SavedTx {
  return (tx as UnsavedTx).id !== undefined;
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
