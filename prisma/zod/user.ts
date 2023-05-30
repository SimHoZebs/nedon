import * as z from "zod"
import { CompleteGroup, RelatedGroupModel, CompleteTransaction, RelatedTransactionModel, CompleteFriend, RelatedFriendModel } from "./index"

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
  groupArray: CompleteGroup[]
  splitTransactionID: CompleteTransaction[]
  friendArray: CompleteFriend[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  groupArray: RelatedGroupModel.array(),
  splitTransactionID: RelatedTransactionModel.array(),
  friendArray: RelatedFriendModel.array(),
}))
