import type { Group, User } from "@prisma/client";
import type { Cat, Split, Tx } from "@prisma/client";
import type { Transaction } from "plaid";
import {
  CatOptionalDefaultsSchema,
  CatSchema,
  SplitOptionalDefaultsSchema,
  TxOptionalDefaultsSchema,
  UserSchema,
} from "prisma/generated/zod";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  groupArray?: Group[]; //user loaded from groups
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

export function isFullTxInDB(tx: FullTxClientSide): tx is FullTx {
  return !!tx.id;
}

export type TxInDB = Tx & { splitArray: Split[]; catArray: Cat[] };

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
  txId: z.string().optional(),
});
export type SplitClientSide = z.infer<typeof SplitClientSideSchema>;

export const isSplitInDB = (split: SplitClientSide): split is Split => {
  return split.id !== undefined;
};
export const isSplitArrayInDB = (obj: unknown): obj is Split[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isSplitInDB);
};

export const TxClientSideSchema = TxOptionalDefaultsSchema.extend({
  txId: z.string().optional(),
  catArray: z.array(CatClientSideSchema),
  splitArray: z.array(SplitClientSideSchema),
});
export type TxClientSide = z.infer<typeof TxClientSideSchema>;

export type FullTxClientSide = Transaction & TxClientSide;

export const FullTxSchema = TxOptionalDefaultsSchema.extend({
  catArray: z.array(CatSchema),
  splitArray: z.array(SplitOptionalDefaultsSchema),
});
export type FullTx = z.infer<typeof FullTxSchema> & Transaction;

export function isPlaidTx(plaidTx: unknown): plaidTx is FullTxClientSide {
  return (plaidTx as FullTxClientSide).id !== undefined;
}
