import { z } from "zod";

export const MdsType = {
  UNDETERMINED: "UNDETERMINED",
  MANDATORY: "MANDATORY",
  DISCRETIONARY: "DISCRETIONARY",
  SAVING: "SAVING",
} as const;

export const MdsTypeSchema = z.enum(MdsType);
export type MdsType = z.infer<typeof MdsTypeSchema>;

export const TxKind = {
  ORIGINAL: "ORIGINAL",
  USER: "USER",
  SPLIT: "SPLIT",
} as const;

export const TxKindSchema = z.enum(TxKind);
export type TxKind = z.infer<typeof TxKindSchema>;
