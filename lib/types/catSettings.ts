import { CatSettingsModelSchema } from "prisma/generated/schemas";
import type { z } from "zod";

export const catSettingsClientSideSchema = CatSettingsModelSchema;

export type CatSettingsClientSide = z.infer<typeof catSettingsClientSideSchema>;
