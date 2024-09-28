import type { Cat, Split, Tx } from "@prisma/client";
import {
  ReceiptOptionalDefaultsWithChildrenSchema,
  type ReceiptOptionalDefaultsWithChildren,
} from "./receipt";
import { z } from "zod";
import { CatClientSideSchema } from "./cat";
import { SplitClientSideSchema } from "./split";
import { plaidTxSchema } from "./plaid";
import { TxOptionalDefaultsSchema } from "prisma/generated/zod";

export type TxInDB = Tx & {
  splitArray: Split[];
  catArray: Cat[];
  receipt: ReceiptOptionalDefaultsWithChildren | null;
};

export const TxClientSideSchema = TxOptionalDefaultsSchema.extend({
  catArray: z.array(CatClientSideSchema),
  splitArray: z.array(SplitClientSideSchema),
  receipt: ReceiptOptionalDefaultsWithChildrenSchema.nullable(),
  plaidTx: plaidTxSchema,
});

export type TxClientSide = z.infer<typeof TxClientSideSchema>;

export function isTxInDB(tx: unknown): tx is Tx {
  return (tx as Tx).id !== undefined;
}
