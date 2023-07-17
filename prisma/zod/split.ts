import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel, CompleteCategoryTree, RelatedCategoryTreeModel, CompleteUser, RelatedUserModel } from "./index"

export const SplitModel = z.object({
  id: z.string(),
  transactionId: z.string(),
  userId: z.string(),
})

export interface CompleteSplit extends z.infer<typeof SplitModel> {
  transaction?: CompleteTransaction | null
  categoryTreeArray: CompleteCategoryTree[]
  user: CompleteUser
}

/**
 * RelatedSplitModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSplitModel: z.ZodSchema<CompleteSplit> = z.lazy(() => SplitModel.extend({
  transaction: RelatedTransactionModel.nullish(),
  categoryTreeArray: RelatedCategoryTreeModel.array(),
  user: RelatedUserModel,
}))
