import * as z from "zod"
import { CompleteSplit, RelatedSplitModel } from "./index"

export const CategoryTreeModel = z.object({
  id: z.string(),
  nameArray: z.string().array(),
  amount: z.number(),
  splitId: z.string().nullish(),
})

export interface CompleteCategoryTree extends z.infer<typeof CategoryTreeModel> {
  Split?: CompleteSplit | null
}

/**
 * RelatedCategoryTreeModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryTreeModel: z.ZodSchema<CompleteCategoryTree> = z.lazy(() => CategoryTreeModel.extend({
  Split: RelatedSplitModel.nullish(),
}))
