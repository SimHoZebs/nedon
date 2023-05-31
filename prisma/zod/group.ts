import * as z from "zod"
import { CompleteUser, RelatedUserModel } from "./index"

export const GroupModel = z.object({
  id: z.string(),
})

export interface CompleteGroup extends z.infer<typeof GroupModel> {
  groupOwner: CompleteUser
  userArray: CompleteUser[]
}

/**
 * RelatedGroupModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGroupModel: z.ZodSchema<CompleteGroup> = z.lazy(() => GroupModel.extend({
  groupOwner: RelatedUserModel,
  userArray: RelatedUserModel.array(),
}))
