import type { Prisma } from "@prisma/client";
import { z } from "zod";

type PureUser = Prisma.UserGetPayload<undefined>;

const PureUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    accessToken: z.string().nullable(),
    publicToken: z.string().nullable(),
    itemId: z.string().nullable(),
    transferId: z.string().nullable(),
    cursor: z.string().nullable(),
  })
  .strict() satisfies z.ZodType<PureUser>;

export type User = Prisma.UserGetPayload<{
  include: {
    myConnectionArray: {
      omit: {
        accessToken: true;
      };
    };
  };
}>;

export const UserSchema = PureUserSchema.extend({
  myConnectionArray: z.array(PureUserSchema.omit({ accessToken: true })),
}).strict() satisfies z.ZodType<User>;

// ---

export const UserClientSideSchema = UserSchema.omit({
  accessToken: true,
})
  .extend({
    hasAccessToken: z.boolean(),
  })
  .strict();

export type UserClientSide = z.infer<typeof UserClientSideSchema>;
