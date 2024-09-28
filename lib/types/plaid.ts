import {
  type Transaction,
  TransactionCode,
  TransactionPaymentChannelEnum,
  TransactionTransactionTypeEnum,
} from "plaid";
import { z } from "zod";

export const TransactionTransactionTypeEnumSchema: z.ZodType<TransactionTransactionTypeEnum> =
  z.nativeEnum(TransactionTransactionTypeEnum);

export const TransactionPaymentChannelEnumSchema: z.ZodType<TransactionPaymentChannelEnum> =
  z.nativeEnum(TransactionPaymentChannelEnum);

export const TransactionCodeSchema: z.ZodType<TransactionCode> =
  z.nativeEnum(TransactionCode);

export const plaidTxSchema: z.ZodType<Transaction> = z.object({
  account_id: z.string(),
  account_owner: z.string().nullable(),
  amount: z.number(),
  authorized_date: z.string().nullable(),
  authorized_datetime: z.string().nullable(),
  datetime: z.string(),
  category: z.array(z.string()),
  category_id: z.string().nullable(),
  date: z.string(),
  iso_currency_code: z.string(),
  location: z.object({
    address: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    lat: z.number().nullable(),
    lon: z.number().nullable(),
    postal_code: z.string().nullable(),
    region: z.string().nullable(),
    store_number: z.string().nullable(),
  }),
  merchant_name: z.string().nullable(),
  name: z.string(),
  payment_channel: TransactionPaymentChannelEnumSchema,
  payment_meta: z.object({
    by_order_of: z.string().nullable(),
    payee: z.string().nullable(),
    payer: z.string().nullable(),
    payment_method: z.string().nullable(),
    payment_processor: z.string().nullable(),
    ppd_id: z.string().nullable(),
    reason: z.string().nullable(),
    reference_number: z.string().nullable(),
  }),
  pending: z.boolean(),
  pending_transaction_id: z.string().nullable(),
  transaction_code: TransactionCodeSchema,
  transaction_id: z.string(),
  transaction_type: TransactionTransactionTypeEnumSchema,
  unofficial_currency_code: z.string().nullable(),
});
