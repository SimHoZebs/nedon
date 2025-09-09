import type { Prisma } from "@prisma/client";
import { CatSettingsSchema } from "prisma/generated/zod";
import { z } from "zod";

export type SavedCatSettings = Prisma.CatSettingsGetPayload<undefined>;

export const SavedCatSettingsSchema =
  CatSettingsSchema.strict() satisfies z.ZodType<SavedCatSettings>;

export const UnsavedCatSettingsSchema = CatSettingsSchema.omit({ id: true })
  .extend({
    id: z.string().optional(),
  })
  .strict();

export type UnsavedCatSettings = z.infer<typeof UnsavedCatSettingsSchema>;
