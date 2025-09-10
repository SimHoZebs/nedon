import type { Prisma } from "@prisma/client";
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

const UserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    accessToken: z.string().nullable(),
    publicToken: z.string().nullable(),
    itemId: z.string().nullable(),
    transferId: z.string().nullable(),
    cursor: z.string().nullable(),
  })
  .strict();

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
