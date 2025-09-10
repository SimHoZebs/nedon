import { CatSettingsSchema } from "./catSettings";

import type { Prisma } from "@prisma/client";
import z from "zod";

type PureUserSettings = Prisma.UserSettingsGetPayload<undefined>;

const PureUserSettingsSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
  })
  .strict() satisfies z.ZodType<PureUserSettings>;

export type UserSettings = Prisma.UserSettingsGetPayload<{
  include: {
    catSettings: true;
  };
}>;

export const UserSettingsSchema = PureUserSettingsSchema.extend({
  catSettings: z.array(CatSettingsSchema),
}).strict() satisfies z.ZodType<UserSettings>;
