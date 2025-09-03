import type { Prisma } from "@prisma/client";
import { UserSchema } from "prisma/generated/zod";
import { z } from "zod";

export type baseUser = Prisma.UserGetPayload<{
  include: {
    myConnectionArray: {
      omit: {
        accessToken: true;
      };
    };
  };
  omit: { accessToken: true };
}>;

export const BaseUserSchema = UserSchema.extend({
  myConnectionArray: z.array(UserSchema.omit({ accessToken: true })),
}).strict() satisfies z.ZodType<baseUser>;

export type UserClientSide = baseUser & {
  hasAccessToken: boolean;
};

export const UserClientSideSchema = BaseUserSchema.extend({
  hasAccessToken: z.boolean(),
}).strict() satisfies z.ZodType<UserClientSide>;
