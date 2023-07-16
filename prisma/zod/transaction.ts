import * as z from "zod"
import { CompleteUser, RelatedUserModel, CompleteCategoryTree, RelatedCategoryTreeModel } from "./index"

export const TransactionModel = z.object({
  id: z.string(),
  ownerId: z.string(),
})

export interface CompleteTransaction extends z.infer<typeof TransactionModel> {
  owner: CompleteUser
  categoryTreeArray: CompleteCategoryTree[]
}

/**
 * RelatedTransactionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTransactionModel: z.ZodSchema<CompleteTransaction> = z.lazy(() => TransactionModel.extend({
  owner: RelatedUserModel,
  categoryTreeArray: RelatedCategoryTreeModel.array(),
}))
