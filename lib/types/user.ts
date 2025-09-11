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

export type Connection = Prisma.UserGetPayload<{
  omit: {
    accessToken: true;
    publicToken: true;
    itemId: true;
    transferId: true;
    cursor: true;
  };
}>;

export const ConnectionSchema = PureUserSchema.omit({
  accessToken: true,
  publicToken: true,
  itemId: true,
  transferId: true,
  cursor: true,
}).strict() satisfies z.ZodType<Connection>;

export type unAuthUser = Prisma.UserGetPayload<{
  include: {
    myConnectionArray: {
      omit: {
        accessToken: true;
      };
    };
  };
}>;

export const unAuthUserSchema = PureUserSchema.extend({
  myConnectionArray: z.array(PureUserSchema.omit({ accessToken: true })),
}).strict() satisfies z.ZodType<unAuthUser>;

export const unAuthUserClientSideSchema = unAuthUserSchema
  .omit({
    accessToken: true,
  })
  .extend({
    hasAccessToken: z.boolean(),
  })
  .strict();

export interface UnAuthUserClientSide
  extends z.infer<typeof unAuthUserClientSideSchema> {}

export const UserSchemaClientSide = unAuthUserClientSideSchema
  .omit({
    publicToken: true,
    itemId: true,
    transferId: true,
  })
  .extend({
    publicToken: z.string(),
    itemId: z.string(),
    transferId: z.string().nullable(),
  })
  .strict();

export interface UserClientSide extends z.infer<typeof UserSchemaClientSide> {}

export const isUserClientSide = (user: unknown): user is UserClientSide => {
  return (user as UserClientSide).itemId !== undefined;
};
