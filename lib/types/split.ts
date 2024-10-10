import {
  type Split,
  SplitOptionalDefaultsSchema,
  SplitSchema,
} from "prisma/generated/zod";
import { z } from "zod";

export const SplitClientSideSchema = SplitOptionalDefaultsSchema.extend({
  originTxId: z.string().optional(),
});
export type SplitClientSide = z.infer<typeof SplitClientSideSchema>;

export const isSplitInDB = (split: SplitClientSide): split is Split => {
  return split.userId !== undefined;
};

export const isSplitArrayInDB = (obj: unknown): obj is Split[] => {
  if (!Array.isArray(obj)) return false;
  try {
    obj.every((item) => SplitSchema.parse(item));
    return true;
  } catch (e) {
    return false;
  }
};
