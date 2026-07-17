import { z } from "zod";

export const SimpleFinErrorSchema = z.object({
  code: z.string(),
  msg: z.string(),
  conn_id: z.string().optional(),
  account_id: z.string().optional(),
});

export const SimpleFinTransactionSchema = z.object({
  id: z.string(),
  posted: z.number(),
  transacted_at: z.number().optional(),
  amount: z.string(),
  description: z.string(),
  pending: z.boolean().optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export const SimpleFinAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  conn_id: z.string(),
  currency: z.string(),
  balance: z.string(),
  "available-balance": z.string().optional(),
  "balance-date": z.number(),
  transactions: z.array(SimpleFinTransactionSchema).default([]),
  extra: z.record(z.string(), z.unknown()).optional(),
});

export const SimpleFinAccountSetSchema = z.object({
  errlist: z.array(SimpleFinErrorSchema),
  connections: z.array(
    z.object({
      conn_id: z.string(),
      name: z.string(),
      org_id: z.string(),
      org_url: z.string().optional(),
      sfin_url: z.string(),
    }),
  ),
  accounts: z.array(SimpleFinAccountSchema),
});

export type SimpleFinAccountSet = z.infer<typeof SimpleFinAccountSetSchema>;
