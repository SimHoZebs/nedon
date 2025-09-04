import { UnsavedCat } from "./cat";
import { plaidTxSchema } from "./plaid";
import {
  BaseReceiptSchema,
  UnsavedReceipt,
  UnsavedReceiptSchema,
} from "./receipt";

import type { Prisma } from "@prisma/client";
import { CatSchema, TxSchema } from "prisma/generated/zod";
import { z } from "zod";

export type BaseTx = Prisma.TxGetPayload<{
  include: { catArray: true; receipt: { include: { items: true } } };
}>;

export const baseTxSchema = TxSchema.omit({ plaidTx: true })
  .extend({
    catArray: CatSchema.array(),
    receipt: BaseReceiptSchema.nullable(),
    plaidTx: plaidTxSchema.nullable(),
  })
  .strict() satisfies z.ZodType<BaseTx>;

//Although cat and split fields are created when a tx is created, they can exist without id when it's being created on the client side.

export const unsavedTxSchema = baseTxSchema
  .omit({
    id: true,
    catArray: true,
    receipt: true,
  })
  .extend({
    id: z.string().optional(),
    catArray: z.array(UnsavedCat),
    receipt: UnsavedReceiptSchema.optional(),
  })
  .strict();

export type UnsavedTx = z.infer<typeof unsavedTxSchema>;

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const TxInDBClientSideSchema = TxSchema.extend({
  catArray: z.array(z.union([UnsavedCat, CatSchema])),
  receipt: UnsavedReceiptSchema.optional(),
  plaidTx: plaidTxSchema.nullable(),
});

export interface TxInDBClientSide
  extends z.infer<typeof TxInDBClientSideSchema> {}

export function isTxInDBClientSide(tx: unknown): tx is TxInDBClientSide {
  return (tx as UnsavedTx).id !== undefined;
}

export const TxInDBSchema = TxInDBClientSideSchema.extend({
  catArray: z.array(CatSchema),
  splitArray: z.array(CatSchema),
  plaidTx: plaidTxSchema.nullable(),
});

export interface TxInDB extends z.infer<typeof TxInDBSchema> {}

export function isTxInDB(tx: unknown): tx is TxInDB {
  return (tx as Tx).id !== undefined;
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
