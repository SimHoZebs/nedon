import { Prisma } from "@prisma/client";
import { z } from "zod";

export type SavedCatSettings = Prisma.CatSettingsGetPayload<undefined>;

const CatSettingsSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    budget: z.instanceof(Prisma.Decimal),
    userSettingsId: z.string(),
    parentId: z.string().nullable(),
  })
  .strict();

export const SavedCatSettingsSchema =
  CatSettingsSchema.strict() satisfies z.ZodType<SavedCatSettings>;

export const UnsavedCatSettingsSchema = CatSettingsSchema.omit({ id: true })
  .extend({
    id: z.string().optional(),
  })
  .strict();

export type UnsavedCatSettings = z.infer<typeof UnsavedCatSettingsSchema>;
