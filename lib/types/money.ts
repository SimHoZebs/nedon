import { z } from "zod";

export const MoneySchema = z
  .string()
  .regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/, "Invalid decimal money value");

export type Money = z.infer<typeof MoneySchema>;
