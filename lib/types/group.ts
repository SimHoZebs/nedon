import {
  type Connection,
  type OMIT_PRIVATE_DATA,
  UnAuthUserClientSideSchema,
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
      omit: typeof OMIT_PRIVATE_DATA;
    };
  };
}>;

const ConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  hasBankSyncToken: z.boolean().optional(),
});

export const GroupSchema = PureGroupSchema.extend({
  userArray: z.array(ConnectionSchema),
}).strict(); // satisfies z.ZodType<Group>; Dropping satisfies for ease during DB transition

export type GroupClientSide = Omit<Group, "userArray"> & {
  userArray: Connection[];
};

export const GroupClientSideSchema = PureGroupSchema.extend({
  userArray: z.array(UnAuthUserClientSideSchema),
}).strict();
