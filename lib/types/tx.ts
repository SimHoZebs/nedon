import { CatFormStateSchema, CatSchema, isSavedCatArray } from "./cat";
import { MdsTypeSchema, TxKindSchema } from "./enums";
import { MoneySchema } from "./money";
import { ReceiptFormStateSchema, ReceiptSchema } from "./receipt";

import { z } from "zod";

const SplitTxSchema = z
  .object({
    id: z.string(),
    kind: TxKindSchema,
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: MoneySchema,
    recurring: z.boolean(),
    mds: MdsTypeSchema,
    bankId: z.string().nullable(),
    name: z.string(),
    amount: MoneySchema,
    datetime: z.date().nullable(),
    authorizedDatetime: z.date(),
    accountId: z.string().nullable(),
    logoUrl: z.string().nullable(),
    isoCurrencyCode: z.string().nullable(),
    locationAddress: z.string().nullable(),
    locationCity: z.string().nullable(),
    locationRegion: z.string().nullable(),
    locationPostalCode: z.string().nullable(),
    locationCountry: z.string().nullable(),
  })
  .strict();

export type SplitTx = z.infer<typeof SplitTxSchema>;

export const SplitTxFormStateSchema = z
  .object({
    id: z.string().optional(),
    kind: TxKindSchema,
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: MoneySchema,
    recurring: z.boolean(),
    mds: MdsTypeSchema,
    bankId: z.string().nullable(),
    name: z.string(),
    amount: MoneySchema,
    datetime: z.date().nullable(),
    authorizedDatetime: z.date(),
    accountId: z.string().nullable(),
    logoUrl: z.string().nullable(),
    isoCurrencyCode: z.string().nullable(),
    locationAddress: z.string().nullable(),
    locationCity: z.string().nullable(),
    locationRegion: z.string().nullable(),
    locationPostalCode: z.string().nullable(),
    locationCountry: z.string().nullable(),
  })
  .strict();

export type SplitTxFormState = z.infer<typeof SplitTxFormStateSchema>;

export const TxSchema = SplitTxSchema.extend({
  splitTxArray: z.array(SplitTxSchema),
  receipt: ReceiptSchema.nullable(),
  catArray: z.array(CatSchema),
}).strict();

export type Tx = z.infer<typeof TxSchema>;

export const TxFormStateSchema = z
  .object({
    id: z.string().optional(),
    kind: TxKindSchema,
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: MoneySchema,
    recurring: z.boolean(),
    mds: MdsTypeSchema,
    bankId: z.string().nullable(),
    name: z.string(),
    amount: MoneySchema,
    datetime: z.date().nullable(),
    authorizedDatetime: z.date(),
    accountId: z.string().nullable(),
    logoUrl: z.string().nullable(),
    isoCurrencyCode: z.string().nullable(),
    locationAddress: z.string().nullable(),
    locationCity: z.string().nullable(),
    locationRegion: z.string().nullable(),
    locationPostalCode: z.string().nullable(),
    locationCountry: z.string().nullable(),
    splitTxArray: z.array(SplitTxFormStateSchema),
    receipt: ReceiptFormStateSchema.nullable(),
    catArray: z.array(CatFormStateSchema),
  })
  .strict();

export type TxFormState = z.infer<typeof TxFormStateSchema>;

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
