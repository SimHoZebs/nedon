import { MoneySchema } from "./money";

import { z } from "zod";

export const CatSchema = z
  .object({
    id: z.string(),
    amount: MoneySchema,
    primary: z.string(),
    detailed: z.string(),
    description: z.string(),
    txId: z.string(),
  })
  .strict();

export type Cat = z.infer<typeof CatSchema>;

export const CatFormStateSchema = z
  .object({
    id: z.string().optional(),
    amount: MoneySchema,
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
