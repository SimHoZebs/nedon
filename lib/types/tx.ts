import { CatFormStateSchema, CatSchema, isSavedCatArray } from "./cat";
import { ReceiptFormStateSchema, ReceiptSchema } from "./receipt";

import { MdsType, Prisma, TxKind } from "@prisma/client";
import { z } from "zod";

export type SplitTx = Prisma.TxGetPayload<undefined>;

const SplitTx = z
  .object({
    id: z.string(),
    kind: z.nativeEnum(TxKind),
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: z.instanceof(Prisma.Decimal),
    recurring: z.boolean(),
    mds: z.nativeEnum(MdsType),
    bankId: z.string().nullable(),
    name: z.string(),
    amount: z.instanceof(Prisma.Decimal),
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
  .strict() satisfies z.ZodType<SplitTx>;

export const SplitTxFormStateSchema = z
  .object({
    id: z.string().optional(),
    kind: z.nativeEnum(TxKind),
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: z.number(),
    recurring: z.boolean(),
    mds: z.nativeEnum(MdsType),
    bankId: z.string().nullable(),
    name: z.string(),
    amount: z.number(),
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
}).strict() satisfies z.ZodType<Tx>;

export const TxFormStateSchema = z
  .object({
    id: z.string().optional(),
    kind: z.nativeEnum(TxKind),
    ownerId: z.string(),
    originalBankTxId: z.string().nullable(),
    originTxId: z.string().nullable(),
    userTotal: z.number(),
    recurring: z.boolean(),
    mds: z.nativeEnum(MdsType),
    bankId: z.string().nullable(),
    name: z.string(),
    amount: z.number(),
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
