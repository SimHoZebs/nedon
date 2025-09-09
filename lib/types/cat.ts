import type { SavedTx } from "./tx";

import type { Cat, Prisma } from "@prisma/client";
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
  txArray: SavedTx[];
  subCatArray: TreedCatWithTx[];
};

export type BaseCat = Prisma.CatGetPayload<undefined>;

export const BaseCatSchema = CatSchema.strict() satisfies z.ZodType<BaseCat>;

/* Considering making txId optional? Ask yourself:
 * - Should a cat exist without being associated with a transaction?
 * - can we create a uuid for txId on the client side?
 * */
export type UnsavedCat = Prisma.CatGetPayload<{
  omit: { id: true };
}> & {
  id?: string;
};

export const UnsavedCatSchema = CatSchema.omit({ id: true })
  .extend({
    id: z.string().optional(),
  })
  .strict() satisfies z.ZodType<UnsavedCat>;

export const isCatInDB = (cat: UnsavedCat): cat is Cat => {
  return cat.id !== undefined;
};

export const isCatArrayInDB = (obj: unknown): obj is Cat[] => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isCatInDB);
};
