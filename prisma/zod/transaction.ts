import * as z from "zod"
import { CompleteLocation, RelatedLocationModel, CompletePaymentMeta, RelatedPaymentMetaModel } from "./index"

export const TransactionModel = z.object({
  transaction_id: z.string(),
  account_id: z.string(),
  amount: z.number(),
  iso_currency_code: z.string().nullish(),
  unofficial_currency_code: z.string().nullish(),
  category: z.string().array(),
  category_id: z.string().nullish(),
  check_number: z.number().int().nullish(),
  date: z.date(),
  name: z.string(),
  merchant_name: z.string().nullish(),
  pending: z.boolean(),
  pending_transaction_id: z.string().nullish(),
  authorized_date: z.date(),
  authorized_datetime: z.date(),
  payment_channel: z.string().nullish(),
  account_owner: z.string().nullish(),
})

export interface CompleteTransaction extends z.infer<typeof TransactionModel> {
  location?: CompleteLocation | null
  payment_meta?: CompletePaymentMeta | null
}

/**
 * RelatedTransactionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTransactionModel: z.ZodSchema<CompleteTransaction> = z.lazy(() => TransactionModel.extend({
  location: RelatedLocationModel.nullish(),
  payment_meta: RelatedPaymentMetaModel.nullish(),
}))
