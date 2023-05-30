import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const FriendListModel = z.object({
  id: z.string(),
})

export interface CompleteFriendList extends z.infer<typeof FriendListModel> {
  array: CompleteUser[]
}

/**
 * RelatedFriendListModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFriendListModel: z.ZodSchema<CompleteFriendList> = z.lazy(() => FriendListModel.extend({
  array: RelatedUserModel.array(),
}))
