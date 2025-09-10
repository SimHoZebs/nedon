import {
  type Connection,
  ConnectionSchema,
  unAuthUserClientSideSchema,
} from "./user";

import type { Prisma } from "@prisma/client";
import z from "zod";

type PureGroup = Prisma.GroupGetPayload<undefined>;
const PureGroupSchema = z
  .object({
    id: z.string(),
    ownerId: z.string(),
  })
  .strict() satisfies z.ZodType<PureGroup>;

export type Group = Prisma.GroupGetPayload<{
  include: {
    userArray: {
      omit: {
        accessToken: true;
        publicToken: true;
        itemId: true;
        transferId: true;
        cursor: true;
      };
    };
  };
}>;

export const GroupSchema = PureGroupSchema.extend({
  userArray: ConnectionSchema.array(),
}).strict() satisfies z.ZodType<Group>;

export type GroupClientSide = Omit<Group, "userArray"> & {
  userArray: Connection[];
};

export const GroupClientSideSchema = PureGroupSchema.extend({
  userArray: z.array(unAuthUserClientSideSchema),
}).strict() satisfies z.ZodType<GroupClientSide>;
