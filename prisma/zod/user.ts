import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel, CompleteSplit, RelatedSplitModel, CompleteGroup, RelatedGroupModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  name: z.string(),
  ACCESS_TOKEN: z.string().nullish(),
  PUBLIC_TOKEN: z.string().nullish(),
  ITEM_ID: z.string().nullish(),
  TRANSFER_ID: z.string().nullish(),
  PAYMENT_ID: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  transactionArray: CompleteTransaction[]
  splitArray: CompleteSplit[]
  myGroup: CompleteGroup[]
  groupArray: CompleteGroup[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  transactionArray: RelatedTransactionModel.array(),
  splitArray: RelatedSplitModel.array(),
  myGroup: RelatedGroupModel.array(),
  groupArray: RelatedGroupModel.array(),
}))
