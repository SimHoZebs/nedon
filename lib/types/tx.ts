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
export const TxSoloSchema = TxOptionalDefaultsSchema.extend({
  catArray: z.array(CatClientSideSchema),
  splitArray: z.array(SplitClientSideSchema),
  receipt: ReceiptOptionalDefaultsWithChildrenSchema.nullable(),
});

export interface TxSolo extends z.infer<typeof TxSoloSchema> {}

export const TxClientSideSchema = TxSoloSchema.extend({
  plaidTx: plaidTxSchema.nullable(),
});

export interface TxClientSide extends z.infer<typeof TxClientSideSchema> {}

export const TxInDBSchema = TxSchema.extend({
  catArray: z.union([z.array(CatClientSideSchema), z.array(CatSchema)]),
  splitArray: z.union([z.array(SplitClientSideSchema), z.array(SplitSchema)]),
  receipt: ReceiptOptionalDefaultsWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema.nullable(),
});

export interface TxInDB extends z.infer<typeof TxInDBSchema> {}

export function isTxInDB(tx: unknown): tx is TxInDB {
  return (tx as Tx).id !== undefined;
}
