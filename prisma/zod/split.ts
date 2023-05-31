import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel, CompleteUser, RelatedUserModel } from "./index"

export const SplitModel = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
})

export interface CompleteSplit extends z.infer<typeof SplitModel> {
  transaction?: CompleteTransaction | null
  user: CompleteUser
}

/**
 * RelatedSplitModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSplitModel: z.ZodSchema<CompleteSplit> = z.lazy(() => SplitModel.extend({
  transaction: RelatedTransactionModel.nullish(),
  user: RelatedUserModel,
}))
