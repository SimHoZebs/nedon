import { type UserClientSide, UserClientSideSchema } from "./user";

import type { Prisma } from "@prisma/client";
import { GroupSchema } from "prisma/generated/zod";
import z from "zod";

export type GroupWithUserArray = Prisma.GroupGetPayload<{
  include: { userArray: true };
}>;

export type GroupClientSide = Omit<GroupWithUserArray, "userArray"> & {
  userArray: UserClientSide[];
};

export const GroupClientSideSchema = GroupSchema.extend({
  userArray: z.array(UserClientSideSchema),
}).strict() satisfies z.ZodType<GroupClientSide>;
