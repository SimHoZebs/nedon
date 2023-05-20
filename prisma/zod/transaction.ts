import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const TransactionModel = z.object({
  transaction_id: z.string(),
  splitAmount: z.number().array(),
})

export interface CompleteTransaction extends z.infer<typeof TransactionModel> {
  splitUserArray: CompleteUser[]
}

/**
 * RelatedTransactionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTransactionModel: z.ZodSchema<CompleteTransaction> = z.lazy(() => TransactionModel.extend({
  splitUserArray: RelatedUserModel.array(),
}))
