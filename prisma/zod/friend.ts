import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const FriendModel = z.object({
  id: z.string(),
  real: z.boolean(),
})

export interface CompleteFriend extends z.infer<typeof FriendModel> {
  data: CompleteUser
}

/**
 * RelatedFriendModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFriendModel: z.ZodSchema<CompleteFriend> = z.lazy(() => FriendModel.extend({
  data: RelatedUserModel,
}))
