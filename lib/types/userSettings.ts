import { CatSettingsSchema } from "./catSettings";

import z from "zod";

const PureUserSettingsSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
  })
  .strict();

export const UserSettingsSchema = PureUserSettingsSchema.extend({
  catSettings: z.array(CatSettingsSchema),
}).strict();

export type UserSettings = z.infer<typeof UserSettingsSchema>;
