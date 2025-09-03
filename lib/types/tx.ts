import { type CatClientSide, CatClientSideSchema } from "./cat";
import { plaidTxSchema } from "./plaid";
import { ReceiptWithChildrenSchema } from "./receipt";

import type { Prisma, Receipt, Tx } from "@prisma/client";
import { CatSchema, TxSchema } from "prisma/generated/zod";
import { z } from "zod";

export type baseTx = Prisma.TxGetPayload<{
  include: { catArray: true; receipt: true };
}>;

export type unsavedTx = Omit<baseTx, "id" | "catArray" | "receipt"> & {
  id?: string;
  catArray: CatClientSide[];
  receipt?: Receipt;
  plaidTx?: z.infer<typeof plaidTxSchema> | null;
};

//Although cat and split fields are created when a tx is created, they can exist without id when it's being created on the client side.
export const unsavedTxSchema = TxSchema.extend({
  id: z.string().optional(),
  catArray: z.array(CatClientSideSchema),
  receipt: ReceiptWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
}) satisfies z.ZodType<unsavedTx>;

//TxInDB refers to a tx that has an id and is stored in the database, but may have unsaved cat and split.
export const TxInDBClientSideSchema = TxSchema.extend({
  catArray: z.array(z.union([CatClientSideSchema, CatSchema])),
  receipt: ReceiptWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
});

export interface TxInDBClientSide
  extends z.infer<typeof TxInDBClientSideSchema> {}

export function isTxInDBClientSide(tx: unknown): tx is TxInDBClientSide {
  return (tx as Tx).id !== undefined;
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
