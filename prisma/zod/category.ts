import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel } from "./index"

export const CategoryModel = z.object({
  id: z.string(),
  categoryTree: z.string().array(),
  amount: z.number(),
  transactionId: z.string(),
})

export interface CompleteCategory extends z.infer<typeof CategoryModel> {
  transactionArray: CompleteTransaction
}

/**
 * RelatedCategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() => CategoryModel.extend({
  transactionArray: RelatedTransactionModel,
}))
