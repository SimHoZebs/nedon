import type { Group, User } from "@prisma/client";
import type { Transaction } from "plaid";
import { z } from "zod";
import { UserSchema } from "../../prisma/generated/zod";

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

export type StructuredResponse<T> =
  | { success: true; data: T; clientMsg: string; devMsg: string }
  | { success: false; data: undefined; clientMsg: string; devMsg: string };

export const createStructuredResponse = <T>({
  success = false,
  data,
  clientMsg = "Something went wrong. This is a generic error message we don't yet have a specific message for. Please try again or contact support.",
  devMsg = "",
}: StructuredResponse<T>) => {
  return { success, data, clientMsg, devMsg };
};
