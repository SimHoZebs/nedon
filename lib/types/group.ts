import { PublicUserSchema } from "./user";

import z from "zod";

const PureGroupSchema = z
  .object({
    id: z.string(),
    ownerId: z.string(),
  })
  .strict();

export const GroupSchema = PureGroupSchema.extend({
  userArray: z.array(PublicUserSchema),
}).strict();

export type Group = z.infer<typeof GroupSchema>;
export type GroupClientSide = Group;
