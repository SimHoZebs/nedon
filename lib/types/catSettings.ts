import { MoneySchema } from "./money";

import { z } from "zod";

export const CatSettingsSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    budget: MoneySchema,
    userSettingsId: z.string(),
    parentId: z.string().nullable(),
  })
  .strict();

export type CatSettings = z.infer<typeof CatSettingsSchema>;

export const UnsavedCatSettingsSchema = CatSettingsSchema.omit({ id: true })
  .extend({
    id: z.string().optional(),
  })
  .strict();

export type UnsavedCatSettings = z.infer<typeof UnsavedCatSettingsSchema>;
