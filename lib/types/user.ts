import type { Prisma } from "@prisma/client";
import { UserSchema } from "prisma/generated/zod";
import { z } from "zod";

export type BaseUser = Prisma.UserGetPayload<{
  include: {
    myConnectionArray: {
      omit: {
        accessToken: true;
      };
    };
  };
}>;

export const BaseUserSchema = UserSchema.extend({
  myConnectionArray: z.array(UserSchema.omit({ accessToken: true })),
}).strict() satisfies z.ZodType<BaseUser>;

// ---

export const UserClientSideSchema = BaseUserSchema.omit({
  accessToken: true,
})
  .extend({
    hasAccessToken: z.boolean(),
  })
  .strict();

export type UserClientSide = z.infer<typeof UserClientSideSchema>;
