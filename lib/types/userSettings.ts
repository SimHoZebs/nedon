import { SavedCatSettingsSchema } from "./catSettings";

import type { Prisma } from "@prisma/client";
import z from "zod";

export type BaseUserSettings = Prisma.UserSettingsGetPayload<{
  include: {
    catSettings: true;
  };
}>;

const UserSettingsSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
  })
  .strict();

export const BaseUserSettingsSchema = UserSettingsSchema.extend({
  catSettings: z.array(SavedCatSettingsSchema),
}).strict() satisfies z.ZodType<BaseUserSettings>;
