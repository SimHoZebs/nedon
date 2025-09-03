import type { Group } from "@prisma/client";
import type { UserClientSide } from "./user";

export type GroupClientSide = Group & {
  userArray?: UserClientSide[];
};
