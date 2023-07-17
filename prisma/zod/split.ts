import * as z from "zod"
import { CompleteCategoryTree, RelatedCategoryTreeModel, CompleteUser, RelatedUserModel } from "./index"

export const SplitModel = z.object({
  id: z.string(),
  transactionId: z.string(),
  categoryTreeId: z.string(),
  userId: z.string(),
  amount: z.number(),
})

export interface CompleteSplit extends z.infer<typeof SplitModel> {
  categoryTree?: CompleteCategoryTree | null
  user: CompleteUser
}

/**
 * RelatedSplitModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSplitModel: z.ZodSchema<CompleteSplit> = z.lazy(() => SplitModel.extend({
  categoryTree: RelatedCategoryTreeModel.nullish(),
  user: RelatedUserModel,
}))
