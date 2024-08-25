import { ReceiptSchema } from "@/types/receipt";
import type { Group, User } from "@prisma/client";
import type { Cat, Split, Tx } from "@prisma/client";
import type { Transaction } from "plaid";
import {
  CatOptionalDefaultsSchema,
  CatSchema,
  SplitOptionalDefaultsSchema,
  SplitSchema,
  TxOptionalDefaultsSchema,
  UserSchema,
} from "prisma/generated/zod";
import type { ReceiptOptionalDefaultsWithRelations } from "@/types/receipt";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  myConnectionArray?: User[]; //user loaded from connections
};
export const UserClientSideSchema = UserSchema.extend({
  ACCESS_TOKEN: z.string().optional(),
});

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};

export type TreedCat = {
  name: string;
  subCatArray: TreedCat[];
};

export type TreedCatWithTx = {
  name: string;
  budget: number;
  spending: number;
  received: number;
  txArray: FullTxClientSide[];
  subCatArray: TreedCatWithTx[];
};

export type TxInDB = Tx & {
  splitArray: Split[];
  catArray: Cat[];
  receipt: ReceiptOptionalDefaultsWithRelations | null;
};

//CAT
export const CatClientSideSchema = CatOptionalDefaultsSchema.extend({
  txId: z.string().optional(),
});
export type CatClientSide = z.infer<typeof CatClientSideSchema>;

export const isCatInDB = (cat: CatClientSide): cat is Cat => {
  return cat.id !== undefined;
};

export const isCatArrayInDB = (obj: unknown): obj is Cat[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isCatInDB);
};

//SPLIT

export const SplitClientSideSchema = SplitOptionalDefaultsSchema.extend({
  originTxId: z.string().optional(),
});
export type SplitClientSide = z.infer<typeof SplitClientSideSchema>;

export const isSplitInDB = (split: SplitClientSide): split is Split => {
  return split.userId !== undefined;
};
export const isSplitArrayInDB = (obj: unknown): obj is Split[] => {
  if (!Array.isArray(obj)) return false;
  try {
    obj.every((item) => SplitSchema.parse(item));
    return true;
  } catch (e) {
    return false;
  }
};

export const TxClientSideSchema = TxOptionalDefaultsSchema.extend({
  catArray: z.array(CatClientSideSchema),
  splitArray: z.array(SplitClientSideSchema),
  receipt: ReceiptSchema.nullable(),
});
export type TxClientSide = z.infer<typeof TxClientSideSchema>;

export type FullTxClientSide = Transaction & TxClientSide;

export const FullTxSchema = TxOptionalDefaultsSchema.extend({
  id: z.string(),
  catArray: z.array(CatSchema),
  splitArray: z.array(SplitOptionalDefaultsSchema),
  receipt: ReceiptSchema.nullable(),
});
export type FullTx = z.infer<typeof FullTxSchema> & Transaction;

export function isFullTxInDB(tx: FullTxClientSide): tx is FullTx {
  return !!tx.id;
}

export function isPlaidTx(plaidTx: unknown): plaidTx is FullTxClientSide {
  return (plaidTx as FullTxClientSide).id !== undefined;
}
