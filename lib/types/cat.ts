import type { SavedTx } from "./tx";

import { Prisma } from "@prisma/client";
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

export const CatSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    amount: z.instanceof(Prisma.Decimal),
    nameArray: z.array(z.string()),
    txId: z.string(),
  })
  .strict();

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

export const isSavedCat = (cat: unknown): cat is BaseCat => {
  return BaseCatSchema.safeParse(cat).success;
};

export const isSavedCatArray = (obj: unknown): obj is BaseCat[] => {
  return z.array(BaseCatSchema).safeParse(obj).success;
};
