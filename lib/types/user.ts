import { z } from "zod";

export const PublicUserSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .strict();

export type PublicUser = z.infer<typeof PublicUserSchema>;
export type Connection = PublicUser;

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
    hasFinancialConnection: z.boolean(),
    hasCompletedFinancialSync: z.boolean(),
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
    hasFinancialConnection: z.literal(true),
    hasCompletedFinancialSync: z.boolean(),
  })
  .strict();

export interface UserClientSide extends z.infer<typeof UserClientSideSchema> {}

export const ClientUserSchema = z.union([
  UserClientSideSchema,
  UnAuthUserClientSideSchema,
]);

export type ClientUser = z.infer<typeof ClientUserSchema>;

export const isUserClientSide = (user: unknown): user is UserClientSide => {
  return UserClientSideSchema.safeParse(user).success;
};

export const isUnAuthUserClientSide = (
  user: unknown,
): user is UnAuthUserClientSide => {
  return UnAuthUserClientSideSchema.safeParse(user).success;
};
