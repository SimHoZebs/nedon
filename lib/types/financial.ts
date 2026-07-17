import { MoneySchema } from "./money";

import { z } from "zod";

export const FinancialProviderSchema = z.enum(["PLAID", "SIMPLEFIN"]);
export type FinancialProvider = z.infer<typeof FinancialProviderSchema>;

export const FinancialConnectionStatusSchema = z.enum([
  "ACTIVE",
  "ERROR",
  "DISCONNECTED",
]);

export const FinancialConnectionSchema = z
  .object({
    id: z.string(),
    provider: FinancialProviderSchema,
    status: FinancialConnectionStatusSchema,
    lastSyncSuccessAt: z.date().nullable(),
  })
  .strict();

export const FinancialAccountSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    mask: z.string().nullable(),
    type: z.string(),
    subtype: z.string().nullable(),
    currentBalance: MoneySchema.nullable(),
    availableBalance: MoneySchema.nullable(),
    currency: z.string().nullable(),
    balanceDate: z.date().nullable(),
  })
  .strict();

export type FinancialConnection = z.infer<typeof FinancialConnectionSchema>;
export type FinancialAccount = z.infer<typeof FinancialAccountSchema>;
