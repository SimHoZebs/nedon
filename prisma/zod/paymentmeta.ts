import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel } from "./index"

export const PaymentMetaModel = z.object({
  transaction_id: z.string(),
  by_order_of: z.string().nullish(),
  payee: z.string().nullish(),
  payer: z.string().nullish(),
  payment_method: z.string().nullish(),
  payment_processor: z.string().nullish(),
  ppd_id: z.string().nullish(),
  reason: z.string().nullish(),
  reference_number: z.string().nullish(),
})

export interface CompletePaymentMeta extends z.infer<typeof PaymentMetaModel> {
  transaction: CompleteTransaction
}

/**
 * RelatedPaymentMetaModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPaymentMetaModel: z.ZodSchema<CompletePaymentMeta> = z.lazy(() => PaymentMetaModel.extend({
  transaction: RelatedTransactionModel,
}))
