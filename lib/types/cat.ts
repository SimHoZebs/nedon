import { Prisma } from "@prisma/client";
import { z } from "zod";

export type Cat = Prisma.CatGetPayload<undefined>;

export const CatSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    amount: z.instanceof(Prisma.Decimal),
    primary: z.string(),
    detailed: z.string(),
    txId: z.string(),
  })
  .strict() satisfies z.ZodType<Cat>;

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

export const isSavedCat = (cat: unknown): cat is Cat => {
  return CatSchema.safeParse(cat).success;
};

export const isSavedCatArray = (obj: unknown): obj is Cat[] => {
  return z.array(CatSchema).safeParse(obj).success;
};
