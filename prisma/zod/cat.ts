import * as z from "zod";
import { CompleteSplit, RelatedSplitModel } from "./index";

export const CatModel = z.object({
  id: z.string(),
  nameArray: z.string().array(),
  amount: z.number(),
  splitId: z.string(),
});

export interface CompleteCat extends z.infer<typeof CatModel> {
  Split: CompleteSplit;
}

/**
 * RelatedCatModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCatModel: z.ZodSchema<CompleteCat> = z.lazy(() => CatModel.extend({
  Split: RelatedSplitModel,
}));
