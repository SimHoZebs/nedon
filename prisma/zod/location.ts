import * as z from "zod"
import { CompleteTransaction, RelatedTransactionModel } from "./index"

export const LocationModel = z.object({
  transaction_id: z.string(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  region: z.string().nullish(),
  postal_code: z.string().nullish(),
  country: z.string().nullish(),
  lat: z.string().nullish(),
  lon: z.string().nullish(),
  store_number: z.string().nullish(),
})

export interface CompleteLocation extends z.infer<typeof LocationModel> {
  transaction: CompleteTransaction
}

/**
 * RelatedLocationModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedLocationModel: z.ZodSchema<CompleteLocation> = z.lazy(() => LocationModel.extend({
  transaction: RelatedTransactionModel,
}))
