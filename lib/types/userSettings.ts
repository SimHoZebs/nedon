import { Prisma } from "@prisma/client";
import { UserSettingsSchema } from "prisma/generated/zod";
import { BaseCatSchema } from "./cat";
import z from "zod";

export type BaseUserSettings = Prisma.UserSettingsGetPayload<{
  include: {
    catSettings: true;
  };
}>;

export const BaseUserSettingsSchema = UserSettingsSchema.extend({
  catSettings: z.array(BaseCatSchema),
}).strict() satisfies z.ZodType<BaseUserSettings>;
