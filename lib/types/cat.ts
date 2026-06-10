import { Prisma } from "@prisma/client";
import { z } from "zod";

export type Cat = Prisma.CatGetPayload<undefined>;

export const CatSchema = z
  .object({
    id: z.string(),
    amount: z.instanceof(Prisma.Decimal),
    primary: z.string(),
    detailed: z.string(),
    description: z.string(),
    txId: z.string(),
  })
  .strict() satisfies z.ZodType<Cat>;

export const CatFormStateSchema = z
  .object({
    id: z.string().optional(),
    amount: z.number(),
    primary: z.string(),
    detailed: z.string(),
    description: z.string(),
    txId: z.string().optional(),
  })
  .strict();

export type CatFormState = z.infer<typeof CatFormStateSchema>;

export const isSavedCat = (cat: unknown): cat is Cat => {
  return CatSchema.safeParse(cat).success;
};

export const isSavedCatArray = (obj: unknown): obj is Cat[] => {
  return z.array(CatSchema).safeParse(obj).success;
};
