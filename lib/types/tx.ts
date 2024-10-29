import type { Tx } from "@prisma/client";
import {
  CatSchema,
  SplitSchema,
  TxOptionalDefaultsSchema,
  TxSchema,
} from "prisma/generated/zod";
import { z } from "zod";

import { CatClientSideSchema } from "./cat";
import { plaidTxSchema } from "./plaid";
import { ReceiptOptionalDefaultsWithChildrenSchema } from "./receipt";
import { SplitClientSideSchema } from "./split";

//Although cat and split fields are created when a tx is created, they can exist without id when it's being created on the client side.
export const UnsavedTxSchema = TxOptionalDefaultsSchema.extend({
  catArray: z.array(CatClientSideSchema),
  splitArray: z.array(SplitClientSideSchema),
  receipt: ReceiptOptionalDefaultsWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
});

export interface UnsavedTx extends z.infer<typeof UnsavedTxSchema> {}

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const UnsavedTxInDBSchema = TxSchema.extend({
  catArray: z.array(z.union([CatClientSideSchema, CatSchema])),
  splitArray: z.array(z.union([SplitClientSideSchema, SplitSchema])),
  receipt: ReceiptOptionalDefaultsWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
});

export interface UnsavedTxInDB extends z.infer<typeof UnsavedTxInDBSchema> {}

export function isUnsavedTxInDB(tx: unknown): tx is UnsavedTxInDB {
  return (tx as Tx).id !== undefined;
}

export const TxInDBSchema = UnsavedTxInDBSchema.extend({
  catArray: z.array(CatSchema),
  splitArray: z.array(SplitSchema),
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
