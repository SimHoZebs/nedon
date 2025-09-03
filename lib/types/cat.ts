import type { TxInDB } from "./tx";

import type { Cat } from "@prisma/client";
import { CatSchema } from "prisma/generated/zod";
import { z } from "zod";

export type TreedCat = {
  name: string;
  subCatArray: TreedCat[];
};

export type TreedCatWithTx = {
  name: string;
  budget: number;
  spending: number;
  received: number;
  txArray: TxInDB[];
  subCatArray: TreedCatWithTx[];
};

/* Considering making txId optional? Ask yourself:
 * - Should a cat exist without being associated with a transaction?
 * - can we create a uuid for txId on the client side?
 * */
export const CatClientSideSchema = CatSchema.extend({
  id: z.string().optional(),
});

export type CatClientSide = z.infer<typeof CatClientSideSchema>;

export const isCatInDB = (cat: CatClientSide): cat is Cat => {
  return cat.id !== undefined;
};

export const isCatArrayInDB = (obj: unknown): obj is Cat[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isCatInDB);
};
