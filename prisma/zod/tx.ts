import * as z from "zod";
import { CompleteUser, RelatedUserModel, CompleteSplit, RelatedSplitModel } from "./index";

export const TxModel = z.object({
  id: z.string(),
  ownerId: z.string(),
});

export interface CompleteTx extends z.infer<typeof TxModel> {
  owner: CompleteUser;
  splitArray: CompleteSplit[];
}

/**
 * RelatedTxModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTxModel: z.ZodSchema<CompleteTx> = z.lazy(() => TxModel.extend({
  owner: RelatedUserModel,
  splitArray: RelatedSplitModel.array(),
}));
