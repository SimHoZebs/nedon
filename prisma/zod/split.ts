import * as z from "zod";
import { CompleteTx, RelatedTxModel, CompleteCat, RelatedCatModel, CompleteUser, RelatedUserModel } from "./index";

export const SplitModel = z.object({
  id: z.string(),
  txId: z.string(),
  userId: z.string(),
});

export interface CompleteSplit extends z.infer<typeof SplitModel> {
  tx: CompleteTx;
  catArray: CompleteCat[];
  user: CompleteUser;
}

/**
 * RelatedSplitModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSplitModel: z.ZodSchema<CompleteSplit> = z.lazy(() => SplitModel.extend({
  tx: RelatedTxModel,
  catArray: RelatedCatModel.array(),
  user: RelatedUserModel,
}));
