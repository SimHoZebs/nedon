import { UserModelSchema } from "prisma/generated/schemas";
import { z } from "zod";

export const UserClientSideSchema = UserModelSchema.omit({
  ACCESS_TOKEN: true,
}).extend({
  hasAccessToken: z.boolean(),
  myConnectionArray: z.array(UserModelSchema).optional(),
});

export type UserClientSide = z.infer<typeof UserClientSideSchema>;
