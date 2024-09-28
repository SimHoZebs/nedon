import type { Group, User } from "@prisma/client";
import type { Transaction } from "plaid";
import { UserSchema } from "prisma/generated/zod";
import { z } from "zod";

declare global {
  namespace PrismaJson {
    type PlaidTx = Transaction;
  }
}

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
