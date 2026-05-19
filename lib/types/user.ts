import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const OMIT_PRIVATE_DATA = {
  bankAccessToken: true,
  bankSyncToken: true,
} as const;

export type PureUser = Prisma.UserGetPayload<{
  omit: typeof OMIT_PRIVATE_DATA;
}>;

export type Connection = Prisma.UserGetPayload<{
  omit: typeof OMIT_PRIVATE_DATA;
}>;

export const UnAuthUserClientSideSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    myConnectionArray: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
    hasAccessToken: z.boolean(),
    bankSyncToken: z.string().nullable().optional(),
  })
  .strict();

export interface UnAuthUserClientSide
  extends z.infer<typeof UnAuthUserClientSideSchema> {}

export const UserClientSideSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    myConnectionArray: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    ),
    hasAccessToken: z.literal(true),
    bankSyncToken: z.string().nullable().optional(),
  })
  .strict();

export interface UserClientSide extends z.infer<typeof UserClientSideSchema> {}

export const isUserClientSide = (user: unknown): user is UserClientSide => {
  return UserClientSideSchema.safeParse(user).success;
};

export const isUnAuthUserClientSide = (
  user: unknown,
): user is UnAuthUserClientSide => {
  return UnAuthUserClientSideSchema.safeParse(user).success;
};
