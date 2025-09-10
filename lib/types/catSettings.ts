import { Prisma } from "@prisma/client";
import { z } from "zod";

export type CatSettings = Prisma.CatSettingsGetPayload<undefined>;

export const CatSettingsSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    budget: z.instanceof(Prisma.Decimal),
    userSettingsId: z.string(),
    parentId: z.string().nullable(),
  })
  .strict();

export const UnsavedCatSettingsSchema = CatSettingsSchema.omit({ id: true })
  .extend({
    id: z.string().optional(),
  })
  .strict();

export type UnsavedCatSettings = z.infer<typeof UnsavedCatSettingsSchema>;
