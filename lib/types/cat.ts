import { CatModelSchema, type CatModelType } from "prisma/generated/schemas";
import { z } from "zod";
import type { TxInDB } from "./tx";

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
export const CatClientSideSchema = CatModelSchema.extend({
  id: z.string().optional(),
}).omit({ tx: true });

export type CatClientSide = z.infer<typeof CatClientSideSchema>;

export const isCatInDB = (cat: CatClientSide): cat is CatModelType => {
  return cat.id !== undefined;
};

export const isCatArrayInDB = (obj: unknown): obj is CatModelType[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isCatInDB);
};
