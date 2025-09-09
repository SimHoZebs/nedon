import { SavedCatSettingsSchema } from "./catSettings";

import type { Prisma } from "@prisma/client";
import { UserSettingsSchema } from "prisma/generated/zod";
import z from "zod";

export type BaseUserSettings = Prisma.UserSettingsGetPayload<{
  include: {
    catSettings: true;
  };
}>;

export const BaseUserSettingsSchema = UserSettingsSchema.extend({
  catSettings: z.array(SavedCatSettingsSchema),
}).strict() satisfies z.ZodType<BaseUserSettings>;
