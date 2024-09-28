import type { Group, User } from "@prisma/client";
import { UserSchema } from "prisma/generated/zod";
import { z } from "zod";

export type UserClientSide = Omit<User, "ACCESS_TOKEN"> & {
  hasAccessToken: boolean;
  myConnectionArray?: User[]; //user loaded from connections
};
export const UserClientSideSchema = UserSchema.extend({
  ACCESS_TOKEN: z.string().optional(),
});

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};
