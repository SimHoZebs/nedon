import type { Group, User } from "@prisma/client";
import type { Tx } from "@prisma/client";
import type { Transaction } from "plaid";
import {
  type CatOptionalDefaults,
  CatOptionalDefaultsSchema,
  CatSchema,
  SplitOptionalDefaultsSchema,
  SplitSchema,
  type TxOptionalDefaults,
} from "prisma/generated/zod";
import { UserSchema } from "prisma/generated/zod";
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
  spending: number;
  received: number;
  txArray: FullTx[];
  subCatArray: TreedCatWithTx[];
};

export type MergedCat = Omit<CatOptionalDefaults, "splitId">;

export type CatClientSide = z.infer<typeof CatClientSideSchema>;
export const CatClientSideSchema = CatOptionalDefaultsSchema.extend({
  splitId: z.string().optional(),
});

export function isCatInSplitInDB(
  cat: CatClientSide,
): cat is z.infer<typeof CatSchema> {
  return !!cat.splitId;
}

export function isSplitInDB(split: SplitClientSide): split is SplitInDB {
  return !!split.id;
}
export type SplitInDB = z.infer<typeof SplitInDBSchema>;
export const SplitInDBSchema = SplitSchema.extend({
  catArray: z.array(CatSchema),
});

export type SplitClientSide = z.infer<typeof SplitClientSideModel>;
export const SplitClientSideModel = SplitOptionalDefaultsSchema.extend({
  txId: z.string().optional(),
  catArray: z.array(CatClientSideSchema),
});

export function isFullTxInDB(tx: FullTx): tx is FullTxInDB {
  return !!tx.id;
}
export type FullTxInDB = Tx &
  Transaction & {
    id: string;
    splitArray: SplitClientSide[];
  };

export type FullTx = TxOptionalDefaults &
  Transaction & {
    splitArray: SplitClientSide[];
  };

export type TxInDB = Tx & {
  splitArray: SplitInDB[];
};

export function isPlaidTx(plaidTx: unknown): plaidTx is FullTx {
  return (plaidTx as FullTx).id !== undefined;
}
