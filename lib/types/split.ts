import {
  SplitModelSchema,
  type SplitModelType,
} from "prisma/generated/schemas";
import { z } from "zod";

export const SplitClientSideSchema = SplitModelSchema.extend({
  id: z.string().nullish(),
  txId: z.string().nullish(),
  originTxId: z.string().nullish(),
}).omit({ tx: true, originTx: true, user: true });

export type SplitClientSide = z.infer<typeof SplitClientSideSchema>;

export const isSplitInDB = (
  split: SplitClientSide,
): split is SplitModelType => {
  return split.userId !== undefined;
};

export const isSplitArrayInDB = (obj: unknown): obj is SplitModelType[] => {
  if (!Array.isArray(obj)) return false;
  try {
    obj.every((item) => SplitModelSchema.parse(item));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
