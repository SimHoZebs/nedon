import * as z from "zod"
import { CompleteSplit, RelatedSplitModel } from "./index"

export const CategoryModel = z.object({
  id: z.string(),
  nameArray: z.string().array(),
  amount: z.number(),
  splitId: z.string(),
})

export interface CompleteCategory extends z.infer<typeof CategoryModel> {
  Split: CompleteSplit
}

/**
 * RelatedCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() => CategoryModel.extend({
  Split: RelatedSplitModel,
}))
