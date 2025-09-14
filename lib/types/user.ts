import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const OMIT_PRIVATE_DATA = {
  accessToken: true,
  publicToken: true,
  itemId: true,
  transferId: true,
  cursor: true,
} as const;

export type OmitPrivateData = typeof OMIT_PRIVATE_DATA;

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
  omit: OmitPrivateData;
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
      omit: OmitPrivateData;
    };
  };
}>;

export const unAuthUserSchema = PureUserSchema.extend({
  myConnectionArray: ConnectionSchema.array(),
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
